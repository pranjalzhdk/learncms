"use client";

import { useEffect, useCallback, useRef, useState } from "react";
import { ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { useUIStore } from "@/store/ui-store";
import {
  LESSONS,
  getLesson,
  getNextLesson,
  getConceptProgress,
} from "@/modules/lessons/lesson-definitions";
import { CMS_CONCEPTS } from "@/lib/constants/content-types";
import { actionMatchesStep } from "@/lib/lesson-actions";
import { CMSStudio } from "@/modules/cms-studio/CMSStudio";
import { cn } from "@/lib/utils";

export function LearnPanelContent() {
  const activeLessonSlug = useUIStore((s) => s.activeLessonSlug);
  const activeStepIndex = useUIStore((s) => s.activeStepIndex);
  const completedLessons = useUIStore((s) => s.completedLessons);
  const activeStudioView = useUIStore((s) => s.activeStudioView);
  const setActiveLesson = useUIStore((s) => s.setActiveLesson);
  const setActiveStudioView = useUIStore((s) => s.setActiveStudioView);
  const nextStep = useUIStore((s) => s.nextStep);
  const completeLesson = useUIStore((s) => s.completeLesson);

  const [lessonsOpen, setLessonsOpen] = useState(false);
  const advancingRef = useRef(false);

  const nextLesson = getNextLesson(completedLessons);
  const lesson =
    (activeLessonSlug ? getLesson(activeLessonSlug) : null) ??
    nextLesson ??
    null;

  const isLessonComplete = lesson ? completedLessons.includes(lesson.slug) : false;
  const currentStep = lesson && !isLessonComplete ? lesson.steps[activeStepIndex] : undefined;
  const showMastery = !nextLesson && completedLessons.length === LESSONS.length;

  useEffect(() => {
    if (!activeLessonSlug && nextLesson) setActiveLesson(nextLesson.slug);
  }, [activeLessonSlug, nextLesson, setActiveLesson]);

  useEffect(() => {
    if (currentStep?.studioView && currentStep.studioView !== activeStudioView) {
      setActiveStudioView(currentStep.studioView);
    }
  }, [currentStep?.studioView, activeStudioView, setActiveStudioView]);

  const checkStep = useCallback(
    (action: string) => {
      if (!lesson || !currentStep || advancingRef.current) return;
      if (!actionMatchesStep(currentStep.action, action)) return;

      advancingRef.current = true;
      requestAnimationFrame(() => {
        advancingRef.current = false;
      });

      if (activeStepIndex + 1 >= lesson.steps.length) {
        completeLesson(lesson.slug, lesson.xpReward, lesson.badge.slug, lesson.unlocks, lesson.unlockMessage);
      } else {
        nextStep();
      }
    },
    [lesson, currentStep, activeStepIndex, nextStep, completeLesson]
  );

  if (showMastery) {
    return (
      <div className="h-full flex items-center justify-center p-6 text-center">
        <div>
          <p className="text-3xl mb-3">🏆</p>
          <h2 className="text-lg font-semibold text-neutral-900">All concepts mastered!</h2>
          <p className="text-sm text-neutral-500 mt-1">Use the CMS Studio freely and watch the live preview update.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col min-h-0">
      {/* Collapsible lessons picker */}
      <div className="shrink-0 border-b border-neutral-100">
        <button
          onClick={() => setLessonsOpen(!lessonsOpen)}
          className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-neutral-50"
        >
          <span className="text-[11px] font-medium text-neutral-600">
            {lesson?.title ?? "Lessons"} · {completedLessons.length}/{LESSONS.length}
          </span>
          {lessonsOpen ? <ChevronUp className="w-3.5 h-3.5 text-neutral-400" /> : <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />}
        </button>
        {lessonsOpen && (
          <div className="max-h-40 overflow-y-auto px-2 pb-2 space-y-2">
            {CMS_CONCEPTS.map((concept) => {
              const conceptLessons = LESSONS.filter((l) => l.concept === concept.id);
              if (!conceptLessons.length) return null;
              const progress = getConceptProgress(concept.id, completedLessons);
              return (
                <div key={concept.id}>
                  <p className="text-[9px] font-medium text-neutral-400 uppercase px-1 mb-0.5">
                    {concept.label} ({progress.done}/{progress.total})
                  </p>
                  {conceptLessons.map((l) => {
                    const done = completedLessons.includes(l.slug);
                    const active = l.slug === lesson?.slug;
                    return (
                      <button
                        key={l.slug}
                        onClick={() => { setActiveLesson(l.slug); setLessonsOpen(false); }}
                        className={cn(
                          "w-full text-left px-2 py-1.5 rounded-md text-[11px] flex items-center gap-1.5",
                          active ? "bg-neutral-900 text-white" : done ? "text-neutral-400" : "text-neutral-600 hover:bg-neutral-50"
                        )}
                      >
                        <span>{l.badge.icon}</span>
                        <span className="flex-1 truncate">{l.title}</span>
                        {done && <span className="text-emerald-500 text-[10px]">✓</span>}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Current step instruction */}
      {lesson && (currentStep || isLessonComplete) && (
        <div className="shrink-0 px-3 py-2.5 bg-gradient-to-r from-violet-50/80 to-indigo-50/50 border-b border-neutral-100">
          {currentStep ? (
            <>
              <div className="flex items-center gap-1.5 text-[10px] text-violet-600 mb-0.5">
                <Sparkles className="w-3 h-3" />
                Step {activeStepIndex + 1}/{lesson.steps.length} · {currentStep.studioView.replace(/-/g, " ")}
              </div>
              <p className="text-xs font-semibold text-neutral-900">{currentStep.title}</p>
              <p className="text-[11px] text-neutral-500 mt-0.5 leading-relaxed line-clamp-2">{currentStep.instruction}</p>
              <div className="flex gap-1 mt-2">
                {lesson.steps.map((_, i) => (
                  <span
                    key={i}
                    className={cn(
                      "h-1 flex-1 rounded-full",
                      i < activeStepIndex ? "bg-emerald-400" : i === activeStepIndex ? "bg-violet-500" : "bg-neutral-200"
                    )}
                  />
                ))}
              </div>
            </>
          ) : (
            <p className="text-xs text-emerald-700">✓ {lesson.title} complete — explore freely.</p>
          )}
        </div>
      )}

      {/* CMS Studio */}
      <div className="flex-1 min-h-0 p-2">
        {lesson ? (
          <div className="h-full min-h-[280px]">
            <CMSStudio onAction={checkStep} expectedAction={currentStep?.action} />
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-sm text-neutral-400">
            Select a lesson to begin
          </div>
        )}
      </div>
    </div>
  );
}
