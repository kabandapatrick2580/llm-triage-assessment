import { useCallback, useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postChat } from "@/api/chatApi";
import { getErrorMessage } from "@/api/axios";
import { deriveConfidence } from "@/utils/confidence";
import { notify } from "@/utils/notifications";
import type { ChatMessage } from "@/types/chat";

const STORAGE_KEY = "gka-chat-history";

function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
}

function loadHistory(): ChatMessage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as ChatMessage[]) : [];
  } catch {
    return [];
  }
}

/**
 * Chat state manager.
 *
 * - Persists the full message history to localStorage.
 * - Sends questions to `POST /api/chat` and normalizes the response into an
 *   assistant message (answer, citations, derived confidence, found flag).
 * - Supports regenerating the last answer and clearing the conversation.
 */
export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>(loadHistory);
  const queryClient = useQueryClient();
  // Track the in-flight assistant message id so we can resolve it in place.
  const pendingIdRef = useRef<string | null>(null);

  // Persist to localStorage whenever messages change.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {
      // Quota or serialization failure — non-fatal.
    }
  }, [messages]);

  const mutation = useMutation({
    mutationFn: (question: string) => postChat({ question }),
    onSuccess: (data) => {
      const pendingId = pendingIdRef.current;
      if (!pendingId) return;

      setMessages((prev) =>
        prev.map((m) =>
          m.id === pendingId
            ? {
                ...m,
                pending: false,
                content: data.answer,
                citations: data.citations,
                foundInKnowledgeBase: data.found_in_knowledge_base,
                confidence: deriveConfidence(data),
                unansweredQuestionId: data.unanswered_question_id,
              }
            : m,
        ),
      );

      // A new knowledge gap was recorded — refresh admin views.
      if (!data.found_in_knowledge_base) {
        notify.success("Knowledge gap recorded successfully.");
        queryClient.invalidateQueries({ queryKey: ["unanswered-questions"] });
      }
    },
    onError: (error) => {
      const pendingId = pendingIdRef.current;
      const message = getErrorMessage(error);
      if (pendingId) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === pendingId
              ? {
                  ...m,
                  pending: false,
                  error: message,
                  content: "",
                }
              : m,
          ),
        );
      }
      notify.error("Could not get an answer", message);
    },
    onSettled: () => {
      pendingIdRef.current = null;
    },
  });

  const ask = useCallback(
    (rawQuestion: string) => {
      const question = rawQuestion.trim();
      if (!question || mutation.isPending) return;

      const now = new Date().toISOString();
      const userMessage: ChatMessage = {
        id: createId(),
        role: "user",
        content: question,
        createdAt: now,
      };
      const assistantId = createId();
      const assistantMessage: ChatMessage = {
        id: assistantId,
        role: "assistant",
        content: "",
        createdAt: now,
        pending: true,
      };

      pendingIdRef.current = assistantId;
      setMessages((prev) => [...prev, userMessage, assistantMessage]);
      mutation.mutate(question);
    },
    [mutation],
  );

  /** Re-run the most recent user question, replacing its assistant answer. */
  const regenerate = useCallback(() => {
    if (mutation.isPending) return;
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    if (!lastUser) return;

    const now = new Date().toISOString();
    const assistantId = createId();
    const assistantMessage: ChatMessage = {
      id: assistantId,
      role: "assistant",
      content: "",
      createdAt: now,
      pending: true,
    };

    // Drop the trailing assistant message (if any) and append a fresh one.
    setMessages((prev) => {
      const trimmed =
        prev.length && prev[prev.length - 1].role === "assistant"
          ? prev.slice(0, -1)
          : prev;
      return [...trimmed, assistantMessage];
    });
    pendingIdRef.current = assistantId;
    mutation.mutate(lastUser.content);
  }, [messages, mutation]);

  const clear = useCallback(() => {
    setMessages([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    messages,
    ask,
    regenerate,
    clear,
    isResponding: mutation.isPending,
  };
}
