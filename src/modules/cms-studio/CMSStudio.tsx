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
import { actionMatchesStep } from "@/lib/lesson-actions";

const TABS: { id: CMSStudioView; label: string; icon: string; tabAction?: string }[] = [
  { id: "content-types", label: "Content Types", icon: "🏛️" },
  { id: "editor", label: "Editor", icon: "✏️" },
  { id: "media", label: "Media", icon: "🖼️", tabAction: "open-media" },
  { id: "schema", label: "Schema", icon: "🏗️", tabAction: "open-modeling" },
  { id: "roles", label: "Roles", icon: "🔐", tabAction: "explore-roles" },
  { id: "api", label: "API", icon: "⚡", tabAction: "inspect-api" },
];

export function CMSStudio({
  onAction,
  expectedAction,
}: {
  onAction?: (action: string) => void;
  expectedAction?: string;
}) {
  const activeView = useUIStore((s) => s.activeStudioView);
  const setView = useUIStore((s) => s.setActiveStudioView);

  const fireAction = (action: string) => {
    if (expectedAction && !actionMatchesStep(expectedAction, action)) return;
    onAction?.(action);
  };

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      <div className="flex border-b border-neutral-100 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setView(tab.id);
              if (tab.tabAction) fireAction(tab.tabAction);
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
        {activeView === "content-types" && <ContentTypesPanel onAction={fireAction} expectedAction={expectedAction} />}
        {activeView === "editor" && <ContentEditorPanel onAction={fireAction} expectedAction={expectedAction} />}
        {activeView === "media" && <MediaLibraryPanel onAction={fireAction} />}
        {activeView === "schema" && <SchemaBuilderPanel onAction={fireAction} expectedAction={expectedAction} />}
        {activeView === "roles" && <RolesPanel onAction={fireAction} expectedAction={expectedAction} />}
        {activeView === "api" && <APIInspectorPanel onAction={fireAction} />}
      </div>
    </div>
  );
}
