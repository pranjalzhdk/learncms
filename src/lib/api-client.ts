import type { CMSConnectionConfig, ConnectionStats } from "@/modules/cms/types";

type EventLogger = (event: {
  phase: "cms-change" | "request" | "response" | "frontend-update";
  method?: string;
  endpoint?: string;
  status?: number;
  duration?: number;
  payload?: unknown;
}) => void;

let eventLogger: EventLogger | null = null;

export function setApiEventLogger(logger: EventLogger) {
  eventLogger = logger;
}

export function getCMSHeaders(config: CMSConnectionConfig | null): HeadersInit {
  if (!config || config.provider === "demo") {
    return { "Content-Type": "application/json", "x-cms-provider": "demo" };
  }
  return {
    "Content-Type": "application/json",
    "x-cms-provider": config.provider,
    ...(config.projectId && { "x-cms-project-id": config.projectId }),
    ...(config.dataset && { "x-cms-dataset": config.dataset }),
    ...(config.apiToken && { "x-cms-token": config.apiToken }),
    ...(config.apiUrl && { "x-cms-api-url": config.apiUrl }),
  };
}

async function trackedFetch(
  url: string,
  options: RequestInit,
  config: CMSConnectionConfig | null
) {
  const start = Date.now();
  const method = options.method ?? "GET";

  eventLogger?.({ phase: "cms-change", method, endpoint: url });
  eventLogger?.({ phase: "request", method, endpoint: url });

  const res = await fetch(url, { ...options, headers: { ...getCMSHeaders(config), ...options.headers } });
  const duration = Date.now() - start;
  const json = await res.json();

  eventLogger?.({
    phase: "response",
    method,
    endpoint: url,
    status: res.status,
    duration,
    payload: json,
  });

  if (res.ok) {
    eventLogger?.({ phase: "frontend-update", payload: { synced: true } });
  }

  if (!res.ok) throw new Error(json.error ?? `Request failed: ${res.status}`);
  return json;
}

export async function fetchContent(config: CMSConnectionConfig | null) {
  return trackedFetch("/api/content", {}, config) as Promise<{
    data: import("@/modules/cms/types").ContentEntry[];
  }>;
}

export async function createContent(
  config: CMSConnectionConfig | null,
  input: import("@/modules/cms/types").CreateContentInput
) {
  return trackedFetch("/api/content", {
    method: "POST",
    body: JSON.stringify(input),
  }, config) as Promise<{ data: import("@/modules/cms/types").ContentEntry }>;
}

export async function updateContent(
  config: CMSConnectionConfig | null,
  id: string,
  input: import("@/modules/cms/types").UpdateContentInput
) {
  return trackedFetch(`/api/content/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  }, config) as Promise<{ data: import("@/modules/cms/types").ContentEntry }>;
}

export async function deleteContent(config: CMSConnectionConfig | null, id: string) {
  return trackedFetch(`/api/content/${id}`, { method: "DELETE" }, config) as Promise<{ success: boolean }>;
}

export async function validateCMSConnection(config: CMSConnectionConfig) {
  const res = await fetch("/api/cms-connect", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(config),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? "Connection failed");
  return json as { success: boolean; stats: ConnectionStats };
}
