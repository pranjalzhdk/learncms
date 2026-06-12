"use client";

import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export function PlaygroundPanel({
  title,
  icon,
  open,
  onClose,
  children,
  className,
  headerRight,
  closable = true,
}: {
  title: string;
  icon?: string;
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  headerRight?: React.ReactNode;
  closable?: boolean;
}) {
  if (!open) return null;

  return (
    <div className={cn("flex flex-col bg-white border-neutral-200 overflow-hidden", className)}>
      <div className="flex items-center justify-between px-3 py-2 border-b border-neutral-100 bg-neutral-50/80 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          {icon && <span className="text-sm">{icon}</span>}
          <span className="text-xs font-semibold text-neutral-700 truncate">{title}</span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {headerRight}
          {closable && (
            <button
              onClick={onClose}
              className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200/80"
              aria-label={`Close ${title}`}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
      <div className="flex-1 min-h-0 overflow-hidden">{children}</div>
    </div>
  );
}
