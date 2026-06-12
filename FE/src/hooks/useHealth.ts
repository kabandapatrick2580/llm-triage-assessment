import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/api/axios";

export interface HealthData {
  status: string;
  use_cases?: { triage: boolean; knowledge: boolean };
}

async function fetchHealth(): Promise<HealthData> {
  const { data } = await apiClient.get<HealthData>("/health", {
    timeout: 8000,
  });
  return data;
}

/** Polls /health; exposes reachability + which use cases the backend serves. */
export function useHealth() {
  const query = useQuery({
    queryKey: ["health"],
    queryFn: fetchHealth,
    refetchInterval: 30_000,
    retry: false,
  });

  const online = !!query.data && query.data.status === "healthy" && !query.isError;
  // Undefined until we know; only `false` when the backend explicitly reports it.
  const knowledgeEnabled = query.data?.use_cases?.knowledge;

  return { ...query, online, knowledgeEnabled };
}
