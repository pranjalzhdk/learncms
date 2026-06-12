"use client";

import { motion } from "framer-motion";
import { useUIStore } from "@/store/ui-store";
import { cn } from "@/lib/utils";

const PHASE_LABELS: Record<string, string> = {
  "cms-change": "CMS Change Detected",
  request: "API Request Sent",
  response: "Response Received",
  "frontend-update": "Frontend Updated",
};

export function LiveEventPanel() {
  const events = useUIStore((s) => s.apiEvents);
  const clearApiEvents = useUIStore((s) => s.clearApiEvents);

  if (events.length === 0) {
    return (
      <div className="text-xs text-neutral-400 py-4 text-center">
        API events will appear here when you edit content
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider">Live API Flow</p>
        <button onClick={clearApiEvents} className="text-[10px] text-neutral-400 hover:text-neutral-600">
          Clear
        </button>
      </div>
      <div className="space-y-1.5 max-h-48 overflow-y-auto">
        {events.slice(0, 8).map((event, i) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            className={cn(
              "text-[11px] font-mono px-3 py-2 rounded-lg border",
              i === 0 ? "bg-emerald-50 border-emerald-100 text-emerald-800" : "bg-neutral-50 border-neutral-100 text-neutral-600"
            )}
          >
            <p className="font-sans font-medium text-[10px] uppercase tracking-wide mb-0.5">
              {PHASE_LABELS[event.phase]}
            </p>
            {event.method && (
              <p>
                <span className={event.status === 200 ? "text-emerald-600" : "text-red-500"}>
                  {event.status ?? "..."} 
                </span>
                {" "}{event.method} {event.endpoint}
                {event.duration && <span className="text-neutral-400"> · {event.duration}ms</span>}
              </p>
            )}
            {event.phase === "frontend-update" && (
              <p className="text-emerald-600">Website re-rendered with new data</p>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
