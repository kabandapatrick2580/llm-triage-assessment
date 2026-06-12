import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  ApiError,
  checkHealth,
  listTickets,
  triage as triageRequest,
} from "./api";
import type { Ticket } from "./types";

type ModelStatus = "checking" | "online" | "offline";

interface TicketsState {
  tickets: Ticket[];
  loading: boolean;
  error: string | null;
  modelStatus: ModelStatus;
  lastTriagedId: number | null;
  refresh: () => Promise<void>;
  submit: (text: string) => Promise<Ticket>;
}

const TicketsContext = createContext<TicketsState | null>(null);

export function TicketsProvider({ children }: { children: React.ReactNode }) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modelStatus, setModelStatus] = useState<ModelStatus>("checking");
  const [lastTriagedId, setLastTriagedId] = useState<number | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const page = await listTickets({});
      setTickets(page.data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load tickets.");
    } finally {
      setLoading(false);
    }
  }, []);

  const submit = useCallback(async (text: string) => {
    const { data } = await triageRequest(text);
    setModelStatus("online");
    setTickets((prev) => [data, ...prev]);
    setLastTriagedId(data.id);
    return data;
  }, []);

  useEffect(() => {
    refresh();
    // Probe model availability for the sidebar status indicator.
    checkHealth().then((ok) => setModelStatus(ok ? "online" : "offline"));
  }, [refresh]);

  const value = useMemo<TicketsState>(
    () => ({ tickets, loading, error, modelStatus, lastTriagedId, refresh, submit }),
    [tickets, loading, error, modelStatus, lastTriagedId, refresh, submit],
  );

  return <TicketsContext.Provider value={value}>{children}</TicketsContext.Provider>;
}

export function useTickets(): TicketsState {
  const ctx = useContext(TicketsContext);
  if (!ctx) throw new Error("useTickets must be used within TicketsProvider");
  return ctx;
}
