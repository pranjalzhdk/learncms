"use client";

import {
  BookOpen,
  Terminal,
  PanelLeft,
  Sparkles,
} from "lucide-react";
import { useUIStore } from "@/store/ui-store";
import { PlaygroundPanel } from "@/components/playground/PlaygroundPanel";
import { TerminalPanel } from "@/components/playground/TerminalPanel";
import { WebsitePreview } from "@/modules/website/WebsitePreview";
import { LearnPanelContent } from "@/components/playground/LearnPanelContent";
import { cn } from "@/lib/utils";

export function PlaygroundShell() {
  const panelLearnOpen = useUIStore((s) => s.panelLearnOpen);
  const panelTerminalOpen = useUIStore((s) => s.panelTerminalOpen);
  const togglePanelLearn = useUIStore((s) => s.togglePanelLearn);
  const togglePanelTerminal = useUIStore((s) => s.togglePanelTerminal);
  const disconnect = useUIStore((s) => s.disconnect);
  const cmsConfig = useUIStore((s) => s.cmsConfig);
  const xp = useUIStore((s) => s.xp);
  const completedLessons = useUIStore((s) => s.completedLessons);

  return (
    <div className="h-screen flex flex-col bg-[#e8eaed] overflow-hidden">
      <header className="shrink-0 flex items-center justify-between px-3 py-2 bg-white border-b border-neutral-200/80">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-neutral-900 flex items-center justify-center text-white text-xs font-bold">L</div>
          <div>
            <p className="text-sm font-semibold text-neutral-900 leading-none">LearnCMS Playground</p>
            <p className="text-[10px] text-neutral-400 mt-0.5">{cmsConfig?.provider ?? "demo"} · {xp} XP</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <ToolbarToggle
            active={panelLearnOpen}
            icon={<BookOpen className="w-3 h-3" />}
            label="Learn CMS"
            onClick={togglePanelLearn}
          />
          <ToolbarToggle
            active={panelTerminalOpen}
            icon={<Terminal className="w-3 h-3" />}
            label="Terminal"
            onClick={togglePanelTerminal}
          />
          <span className="text-[10px] text-neutral-400 px-2 hidden sm:inline">
            {completedLessons.length}/11 lessons
          </span>
          <button onClick={disconnect} className="text-[10px] text-neutral-400 hover:text-neutral-600 px-2 py-1">
            Disconnect
          </button>
        </div>
      </header>

      <div className="flex-1 flex min-h-0 p-2 gap-2">
        {panelLearnOpen && (
          <PlaygroundPanel
            title="Learn CMS"
            icon="📚"
            open
            onClose={togglePanelLearn}
            className="w-full sm:w-[400px] lg:w-[440px] shrink-0 rounded-xl border shadow-sm"
            headerRight={
              <span className="text-[9px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full flex items-center gap-0.5 mr-1">
                <Sparkles className="w-2.5 h-2.5" /> live
              </span>
            }
          >
            <LearnPanelContent />
          </PlaygroundPanel>
        )}

        <div className="flex-1 flex flex-col min-w-0 gap-2">
          <div className="flex-1 min-h-0 rounded-xl overflow-hidden shadow-sm">
            <WebsitePreview />
          </div>

          {panelTerminalOpen && (
            <div className="h-40 shrink-0 rounded-xl overflow-hidden shadow-sm border border-neutral-800">
              <TerminalPanel onClose={togglePanelTerminal} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ToolbarToggle({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-medium rounded-lg transition-colors",
        active
          ? "text-neutral-700 bg-neutral-100 hover:bg-neutral-200"
          : "text-neutral-400 bg-neutral-50 hover:bg-neutral-100 border border-dashed border-neutral-200"
      )}
    >
      {!active && <PanelLeft className="w-3 h-3 opacity-50" />}
      {icon}
      {label}
    </button>
  );
}
