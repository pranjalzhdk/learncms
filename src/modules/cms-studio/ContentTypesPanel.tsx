"use client";

import { CONTENT_TYPES } from "@/lib/constants/content-types";
import { useUIStore } from "@/store/ui-store";
import { cn } from "@/lib/utils";

export function ContentTypesPanel({ onAction }: { onAction?: (action: string) => void }) {
  const selected = useUIStore((s) => s.selectedContentType);
  const setSelected = useUIStore((s) => s.setSelectedContentType);
  const markExplored = useUIStore((s) => s.markExploredTypes);
  const markSchema = useUIStore((s) => s.markInspectedSchema);

  const selectedType = CONTENT_TYPES.find((t) => t.id === selected);

  return (
    <div className="space-y-4">
      <p className="text-xs text-neutral-500">
        Content types define the structure of your data. Each type has fields that map to API JSON and frontend components.
      </p>
      <div className="grid gap-2">
        {CONTENT_TYPES.map((type) => (
          <button
            key={type.id}
            onClick={() => {
              setSelected(type.id);
              markExplored();
              onAction?.("explore-types");
              if (type.id === "blog-posts") {
                markSchema();
                onAction?.("inspect-schema");
              }
            }}
            className={cn(
              "flex items-start gap-3 p-3 rounded-xl border text-left transition-colors",
              selected === type.id ? "border-neutral-900 bg-neutral-50" : "border-neutral-200 hover:border-neutral-300"
            )}
          >
            <span className="text-xl">{type.icon}</span>
            <div>
              <p className="text-sm font-medium text-neutral-900">{type.name}</p>
              <p className="text-xs text-neutral-500 mt-0.5">{type.description}</p>
            </div>
          </button>
        ))}
      </div>

      {selectedType && (
        <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200">
          <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-2">Schema · {selectedType.name}</p>
          <div className="flex flex-wrap gap-1.5">
            {selectedType.fields.map((f) => (
              <span key={f} className="text-xs px-2 py-1 bg-white border border-neutral-200 rounded-md font-mono">{f}</span>
            ))}
          </div>
          <p className="text-[10px] text-neutral-400 mt-2">These fields appear in the CMS editor, API JSON, and frontend.</p>
        </div>
      )}
    </div>
  );
}
