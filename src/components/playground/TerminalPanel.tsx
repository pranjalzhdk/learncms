"use client";

import { useEffect, useRef } from "react";
import { Trash2, X } from "lucide-react";
import { useUIStore } from "@/store/ui-store";
import { cn } from "@/lib/utils";

const PHASE_COLORS: Record<string, string> = {
  "cms-change": "text-amber-400",
  request: "text-sky-400",
  response: "text-emerald-400",
  "frontend-update": "text-violet-400",
};

export function TerminalPanel({ onClose }: { onClose?: () => void }) {
  const events = useUIStore((s) => s.apiEvents);
  const clearApiEvents = useUIStore((s) => s.clearApiEvents);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [events.length]);

  return (
    <div className="h-full flex flex-col bg-[#0d1117] font-mono text-[11px]">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-white/5 bg-[#161b22] shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500/80" />
          <span className="w-2 h-2 rounded-full bg-amber-500/80" />
          <span className="w-2 h-2 rounded-full bg-emerald-500/80" />
          <span className="text-neutral-500 ml-2">api-terminal — live CMS data flow</span>
        </div>
        {events.length > 0 && (
          <button onClick={clearApiEvents} className="flex items-center gap-1 text-neutral-500 hover:text-neutral-300 px-2 py-0.5 rounded">
            <Trash2 className="w-3 h-3" /> clear
          </button>
        )}
        {onClose && (
          <button onClick={onClose} className="p-1 text-neutral-500 hover:text-neutral-300 rounded" aria-label="Close terminal">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-1">
        {events.length === 0 ? (
          <p className="text-neutral-600">
            <span className="text-emerald-500">$</span> waiting for CMS activity… edit content in the studio to see requests flow here.
          </p>
        ) : (
          events.map((e) => (
            <div key={e.id} className="leading-relaxed">
              <span className="text-neutral-600">{new Date(e.timestamp).toLocaleTimeString()}</span>
              {" "}
              <span className={cn(PHASE_COLORS[e.phase] ?? "text-neutral-400")}>
                [{e.phase}]
              </span>
              {e.method && (
                <span className="text-neutral-300">
                  {" "}{e.method} {e.endpoint}
                  {e.status != null && (
                    <span className={e.status < 400 ? " text-emerald-400" : " text-red-400"}> → {e.status}</span>
                  )}
                  {e.duration != null && <span className="text-neutral-600"> ({e.duration}ms)</span>}
                </span>
              )}
              {e.phase === "frontend-update" && (
                <span className="text-violet-400"> → website preview re-rendered</span>
              )}
            </div>
          ))
        )}
        <p className="text-neutral-700 pt-1">
          <span className="text-emerald-500">$</span> _
        </p>
      </div>
    </div>
  );
}
