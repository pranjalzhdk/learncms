"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const MEDIA_QUERY_KEY = ["media"] as const;

export function useMedia() {
  return useQuery({
    queryKey: MEDIA_QUERY_KEY,
    queryFn: async () => {
      const res = await fetch("/api/media");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to fetch media");
      return json.data as import("@/modules/cms/types").MediaAsset[];
    },
  });
}

export function useCreateMedia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { filename: string; url: string; mimeType?: string; size?: number; alt?: string }) => {
      const res = await fetch("/api/media", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to upload");
      return json.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: MEDIA_QUERY_KEY }),
  });
}
