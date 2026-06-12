"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Lesson } from "@/modules/cms/types";

interface LessonStepProgressProps {
  lesson: Lesson;
  activeStepIndex: number;
}

export function LessonStepProgress({ lesson, activeStepIndex }: LessonStepProgressProps) {
  return (
    <div className="space-y-2">
      <p className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider">Steps</p>
      {lesson.steps.map((step, index) => {
        const done = index < activeStepIndex;
        const active = index === activeStepIndex;
        return (
          <div
            key={step.id}
            className={cn(
              "flex items-start gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-colors",
              active && "bg-blue-50 border border-blue-100",
              done && "opacity-60",
              !active && !done && "opacity-40"
            )}
          >
            <div
              className={cn(
                "w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold mt-0.5",
                done && "bg-emerald-500 text-white",
                active && "bg-blue-600 text-white",
                !done && !active && "bg-neutral-200 text-neutral-500"
              )}
            >
              {done ? <Check className="w-3 h-3" /> : index + 1}
            </div>
            <div>
              <p className={cn("font-medium", active ? "text-blue-900" : "text-neutral-700")}>
                {step.title}
              </p>
              {active && (
                <p className="text-xs text-blue-600/70 mt-0.5 leading-relaxed">{step.instruction}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
