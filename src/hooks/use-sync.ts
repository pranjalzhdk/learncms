"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { CONTENT_QUERY_KEY } from "@/hooks/use-content";

export function useSync() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const source = new EventSource("/api/sync");

    source.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (
          data.type === "content.created" ||
          data.type === "content.updated" ||
          data.type === "content.deleted" ||
          data.type === "content.published"
        ) {
          queryClient.invalidateQueries({ queryKey: CONTENT_QUERY_KEY });
        }
      } catch {
        // ignore parse errors
      }
    };

    source.onerror = () => {
      source.close();
      // Reconnect after delay
      setTimeout(() => {
        // EventSource auto-reconnects in most browsers
      }, 3000);
    };

    return () => source.close();
  }, [queryClient]);
}
