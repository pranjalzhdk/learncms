"use client";

import { useMemo } from "react";
import { useContent } from "@/hooks/use-content";
import { LiveEventPanel } from "@/modules/api/LiveEventPanel";

function highlightJson(json: string) {
  return json
    .replace(/"([^"]+)":/g, '<span class="text-violet-600">"$1"</span>:')
    .replace(/: "([^"]*)"/g, ': <span class="text-emerald-600">"$1"</span>')
    .replace(/: (\d+)/g, ': <span class="text-amber-600">$1</span>')
    .replace(/: (true|false)/g, ': <span class="text-rose-500">$1</span>');
}

export function APIInspectorPanel({ onAction }: { onAction?: (action: string) => void }) {
  const { data, isLoading } = useContent();

  const response = useMemo(() => ({
    data: data?.map((e) => ({
      id: e.id, title: e.title, slug: e.slug, author: e.author,
      published: e.status === "PUBLISHED", category: e.category,
      locale: e.locale, readingTime: e.readingTime, image: e.image,
    })),
    meta: { total: data?.length ?? 0, endpoint: "GET /api/content" },
  }), [data]);

  return (
    <div className="space-y-4" onFocus={() => onAction?.("inspect-api")}>
      <p className="text-xs text-neutral-500">
        The API layer exposes CMS content as JSON. Any frontend — web, mobile, IoT — fetches from these endpoints. No CMS UI needed on the consumer side.
      </p>

      <div className="flex items-center gap-2 text-xs font-mono">
        <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">200 OK</span>
        <span className="text-neutral-500">GET /api/content</span>
      </div>

      {isLoading ? (
        <p className="text-sm text-neutral-400">Loading API response...</p>
      ) : (
        <pre
          className="text-[11px] font-mono leading-relaxed overflow-auto max-h-48 bg-neutral-50 rounded-lg p-4 border border-neutral-100"
          dangerouslySetInnerHTML={{ __html: highlightJson(JSON.stringify(response, null, 2)) }}
        />
      )}

      <div className="border-t border-neutral-100 pt-4">
        <LiveEventPanel />
      </div>
    </div>
  );
}
