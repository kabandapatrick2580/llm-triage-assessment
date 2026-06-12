import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ApiError } from "./api";
import { useTickets } from "./TicketsContext";
import type { RawMessage } from "./types";

const STORAGE_KEY = "triage:intake-queue";

function uid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function load(): RawMessage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as RawMessage[];
    // A "triaging" left over from a refresh mid-call is reset so it isn't stuck.
    return parsed.map((m) =>
      m.status === "triaging" ? { ...m, status: "pending" } : m,
    );
  } catch {
    return [];
  }
}

interface MessagesState {
  messages: RawMessage[];
  triagingIds: Set<string>;
  add: (text: string, from?: string) => void;
  addMany: (items: { text: string; from?: string }[]) => void;
  remove: (id: string) => void;
  clearTriaged: () => void;
  triageOne: (id: string) => Promise<void>;
  triageMany: (ids: string[]) => Promise<void>;
}

const MessagesContext = createContext<MessagesState | null>(null);

export function MessagesProvider({ children }: { children: React.ReactNode }) {
  // Triaging a raw message reuses the same submit() the intake form uses, so a
  // triaged message lands in the Triage Inbox automatically.
  const { submit } = useTickets();
  const [messages, setMessages] = useState<RawMessage[]>(load);
  const [triagingIds, setTriagingIds] = useState<Set<string>>(new Set());

  // Ref keeps triageMany's sequential loop reading fresh message state.
  const messagesRef = useRef(messages);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {
      /* storage full / private mode — queue just won't persist */
    }
  }, [messages]);

  const patch = useCallback((id: string, changes: Partial<RawMessage>) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...changes } : m)),
    );
  }, []);

  const add = useCallback((text: string, from?: string) => {
    const t = text.trim();
    if (!t) return;
    setMessages((prev) => [
      {
        id: uid(),
        text: t,
        from: from?.trim() || null,
        receivedAt: new Date().toISOString(),
        status: "pending",
        ticketId: null,
        error: null,
      },
      ...prev,
    ]);
  }, []);

  const addMany = useCallback((items: { text: string; from?: string }[]) => {
    const now = Date.now();
    const rows: RawMessage[] = items
      .filter((it) => it.text.trim())
      .map((it, i) => ({
        id: uid(),
        text: it.text.trim(),
        from: it.from?.trim() || null,
        // Stagger timestamps so the batch keeps its given order in the table.
        receivedAt: new Date(now - i * 1000).toISOString(),
        status: "pending",
        ticketId: null,
        error: null,
      }));
    if (rows.length) setMessages((prev) => [...rows, ...prev]);
  }, []);

  const remove = useCallback((id: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const clearTriaged = useCallback(() => {
    setMessages((prev) => prev.filter((m) => m.status !== "triaged"));
  }, []);

  const triageOne = useCallback(
    async (id: string) => {
      const msg = messagesRef.current.find((m) => m.id === id);
      if (!msg || msg.status === "triaged") return;

      setTriagingIds((prev) => new Set(prev).add(id));
      patch(id, { status: "triaging", error: null });
      try {
        const ticket = await submit(msg.text);
        patch(id, { status: "triaged", ticketId: ticket.id, error: null });
      } catch (err) {
        const message =
          err instanceof ApiError ? err.message : "Triage failed. Try again.";
        patch(id, { status: "failed", error: message });
      } finally {
        setTriagingIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }
    },
    [patch, submit],
  );

  // Sequential on purpose: a single-worker / self-hosted model handles one call
  // at a time, and the user sees each row flip to "Triaged" as it lands.
  const triageMany = useCallback(
    async (ids: string[]) => {
      for (const id of ids) {
        await triageOne(id);
      }
    },
    [triageOne],
  );

  const value = useMemo<MessagesState>(
    () => ({
      messages,
      triagingIds,
      add,
      addMany,
      remove,
      clearTriaged,
      triageOne,
      triageMany,
    }),
    [
      messages,
      triagingIds,
      add,
      addMany,
      remove,
      clearTriaged,
      triageOne,
      triageMany,
    ],
  );

  return (
    <MessagesContext.Provider value={value}>
      {children}
    </MessagesContext.Provider>
  );
}

export function useMessages(): MessagesState {
  const ctx = useContext(MessagesContext);
  if (!ctx) throw new Error("useMessages must be used within MessagesProvider");
  return ctx;
}
