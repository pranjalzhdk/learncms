"use client";

import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchContent, createContent, updateContent, deleteContent, setApiEventLogger } from "@/lib/api-client";
import { useUIStore } from "@/store/ui-store";
import type { CreateContentInput, UpdateContentInput } from "@/modules/cms/types";

export const CONTENT_QUERY_KEY = ["content"] as const;

export function useContent() {
  const cmsConfig = useUIStore((s) => s.cmsConfig);
  const logApiEvent = useUIStore((s) => s.logApiEvent);
  const isConnected = useUIStore((s) => s.isConnected);

  useEffect(() => {
    setApiEventLogger(logApiEvent);
    return () => setApiEventLogger(() => {});
  }, [logApiEvent]);

  return useQuery({
    queryKey: [...CONTENT_QUERY_KEY, cmsConfig?.provider],
    queryFn: () => fetchContent(cmsConfig),
    select: (res) => res.data,
    enabled: isConnected,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
}

export function useCreateContent() {
  const queryClient = useQueryClient();
  const cmsConfig = useUIStore((s) => s.cmsConfig);

  return useMutation({
    mutationFn: (input: CreateContentInput) => createContent(cmsConfig, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CONTENT_QUERY_KEY }),
  });
}

export function useUpdateContent() {
  const queryClient = useQueryClient();
  const cmsConfig = useUIStore((s) => s.cmsConfig);

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateContentInput }) =>
      updateContent(cmsConfig, id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CONTENT_QUERY_KEY }),
  });
}

export function useDeleteContent() {
  const queryClient = useQueryClient();
  const cmsConfig = useUIStore((s) => s.cmsConfig);

  return useMutation({
    mutationFn: (id: string) => deleteContent(cmsConfig, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CONTENT_QUERY_KEY }),
  });
}

export function usePublishedContent() {
  const { data, ...rest } = useContent();
  const activeLocale = useUIStore((s) => s.activeLocale);
  const unlockedFeatures = useUIStore((s) => s.unlockedFeatures);
  const filterByLocale = unlockedFeatures.includes("language-switcher");

  const published = data?.filter((e) => e.status === "PUBLISHED") ?? [];
  const localized = filterByLocale
    ? published.filter((e) => e.locale === activeLocale)
    : published;

  return {
    data: localized.length > 0 ? localized : published,
    allData: data ?? [],
    ...rest,
  };
}
