"use client";

import { useUIStore } from "@/store/ui-store";
import type { CMSStudioView } from "@/modules/cms/types";
import { ContentTypesPanel } from "./ContentTypesPanel";
import { ContentEditorPanel } from "./ContentEditorPanel";
import { MediaLibraryPanel } from "./MediaLibraryPanel";
import { SchemaBuilderPanel } from "./SchemaBuilderPanel";
import { RolesPanel } from "./RolesPanel";
import { APIInspectorPanel } from "./APIInspectorPanel";
import { cn } from "@/lib/utils";

const TABS: { id: CMSStudioView; label: string; icon: string }[] = [
  { id: "content-types", label: "Content Types", icon: "🏛️" },
  { id: "editor", label: "Editor", icon: "✏️" },
  { id: "media", label: "Media", icon: "🖼️" },
  { id: "schema", label: "Schema", icon: "🏗️" },
  { id: "roles", label: "Roles", icon: "🔐" },
  { id: "api", label: "API", icon: "⚡" },
];

export function CMSStudio({ onAction }: { onAction?: (action: string) => void }) {
  const activeView = useUIStore((s) => s.activeStudioView);
  const setView = useUIStore((s) => s.setActiveStudioView);

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-neutral-200 overflow-hidden">
      <div className="flex border-b border-neutral-100 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setView(tab.id);
              if (tab.id === "media") onAction?.("open-media");
              if (tab.id === "schema") onAction?.("open-modeling");
              if (tab.id === "api") onAction?.("inspect-api");
              if (tab.id === "roles") onAction?.("explore-roles");
            }}
            className={cn(
              "flex items-center gap-1.5 px-4 py-3 text-xs font-medium whitespace-nowrap border-b-2 transition-colors",
              activeView === tab.id ? "border-neutral-900 text-neutral-900" : "border-transparent text-neutral-400 hover:text-neutral-600"
            )}
          >
            <span>{tab.icon}</span> {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-5">
        {activeView === "content-types" && <ContentTypesPanel onAction={onAction} />}
        {activeView === "editor" && <ContentEditorPanel onAction={onAction} />}
        {activeView === "media" && <MediaLibraryPanel onAction={onAction} />}
        {activeView === "schema" && <SchemaBuilderPanel onAction={onAction} />}
        {activeView === "roles" && <RolesPanel onAction={onAction} />}
        {activeView === "api" && <APIInspectorPanel onAction={onAction} />}
      </div>
    </div>
  );
}
