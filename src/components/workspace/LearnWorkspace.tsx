"use client";

import { useEffect, useCallback, useRef } from "react";
import { Globe, Sparkles, ChevronRight } from "lucide-react";
import { useUIStore } from "@/store/ui-store";
import {
  LESSONS,
  getLesson,
  getNextLesson,
  getConceptProgress,
} from "@/modules/lessons/lesson-definitions";
import { CMS_CONCEPTS } from "@/lib/constants/content-types";
import { actionMatchesStep } from "@/lib/lesson-actions";
import { ImmersiveWebsite } from "@/modules/website/ImmersiveWebsite";
import { LessonStepProgress } from "@/modules/lessons/LessonStepProgress";
import { CMSStudio } from "@/modules/cms-studio/CMSStudio";
import { cn } from "@/lib/utils";

export function LearnWorkspace() {
  const cmsConfig = useUIStore((s) => s.cmsConfig);
  const connectionStats = useUIStore((s) => s.connectionStats);
  const activeLessonSlug = useUIStore((s) => s.activeLessonSlug);
  const activeStepIndex = useUIStore((s) => s.activeStepIndex);
  const completedLessons = useUIStore((s) => s.completedLessons);
  const unlockedFeatures = useUIStore((s) => s.unlockedFeatures);
  const activeStudioView = useUIStore((s) => s.activeStudioView);
  const setViewMode = useUIStore((s) => s.setViewMode);
  const setActiveLesson = useUIStore((s) => s.setActiveLesson);
  const setActiveStudioView = useUIStore((s) => s.setActiveStudioView);
  const nextStep = useUIStore((s) => s.nextStep);
  const completeLesson = useUIStore((s) => s.completeLesson);
  const disconnect = useUIStore((s) => s.disconnect);
  const xp = useUIStore((s) => s.xp);

  const advancingRef = useRef(false);

  const nextLesson = getNextLesson(completedLessons);
  const lesson =
    (activeLessonSlug ? getLesson(activeLessonSlug) : null) ??
    nextLesson ??
    null;

  const isLessonComplete = lesson ? completedLessons.includes(lesson.slug) : false;
  const currentStep = lesson && !isLessonComplete ? lesson.steps[activeStepIndex] : undefined;

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

  const showMastery = !nextLesson && completedLessons.length === LESSONS.length;

  return (
    <>
      <ImmersiveWebsite />

      <div className="min-h-screen bg-[#FAFAFA] flex">
        <aside className="w-72 flex-shrink-0 border-r border-neutral-200 bg-white p-5 flex flex-col gap-5 overflow-y-auto">
          <div>
            <h1 className="font-semibold text-neutral-900">LearnCMS</h1>
            <p className="text-[11px] text-neutral-400 mt-0.5">Full CMS Studio · 10 core concepts</p>
            {connectionStats && (
              <div className="mt-2 text-[11px] text-neutral-400 space-y-0.5">
                <p className="text-emerald-600 font-medium">✓ Connected to {cmsConfig?.provider}</p>
                <p>{connectionStats.entryCount} entries · {connectionStats.contentTypeCount} types</p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            {CMS_CONCEPTS.map((concept) => {
              const conceptLessons = LESSONS.filter((l) => l.concept === concept.id);
              if (!conceptLessons.length) return null;
              const progress = getConceptProgress(concept.id, completedLessons);
              return (
                <div key={concept.id}>
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-[10px] font-medium text-neutral-400 uppercase tracking-wider">{concept.label}</p>
                    <span className="text-[10px] text-neutral-300">{progress.done}/{progress.total}</span>
                  </div>
                  <div className="space-y-0.5">
                    {conceptLessons.map((l) => {
                      const done = completedLessons.includes(l.slug);
                      const active = l.slug === lesson?.slug;
                      return (
                        <button
                          key={l.slug}
                          onClick={() => setActiveLesson(l.slug)}
                          className={cn(
                            "w-full text-left px-3 py-2 rounded-lg text-xs flex items-center gap-2",
                            active ? "bg-neutral-900 text-white" : done ? "text-neutral-400" : "text-neutral-600 hover:bg-neutral-50"
                          )}
                        >
                          <span>{l.badge.icon}</span>
                          <span className="flex-1 truncate">{l.title}</span>
                          {done && <span className="text-emerald-500">✓</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {lesson && currentStep && <LessonStepProgress lesson={lesson} activeStepIndex={activeStepIndex} />}

          {isLessonComplete && lesson && (
            <p className="text-xs text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg">
              ✓ {lesson.title} completed — pick another lesson or explore your site.
            </p>
          )}

          {unlockedFeatures.length > 0 && (
            <div>
              <p className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider mb-2">Website Layers</p>
              <div className="flex flex-wrap gap-1">
                {unlockedFeatures.map((f) => (
                  <span key={f} className="text-[10px] px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full">{f.replace(/-/g, " ")}</span>
                ))}
              </div>
            </div>
          )}

          <div className="mt-auto space-y-3">
            <p className="text-xs text-neutral-400">{xp} XP · {completedLessons.length}/{LESSONS.length} lessons</p>
            <button
              onClick={() => setViewMode("explore")}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-neutral-900 text-white text-sm rounded-xl hover:bg-neutral-800"
            >
              <Globe className="w-4 h-4" /> Explore Website
            </button>
            <button onClick={disconnect} className="w-full text-xs text-neutral-400 hover:text-neutral-600">
              Disconnect CMS
            </button>
          </div>
        </aside>

        <main className="flex-1 flex flex-col min-w-0">
          {lesson && (currentStep || isLessonComplete) ? (
            <>
              <div className="px-6 pt-6 pb-4 border-b border-neutral-200 bg-white">
                <div className="flex items-start justify-between gap-4 max-w-4xl">
                  <div>
                    {currentStep ? (
                      <>
                        <div className="flex items-center gap-2 text-xs text-neutral-400 mb-1">
                          <Sparkles className="w-3.5 h-3.5" />
                          {lesson.title} · Step {activeStepIndex + 1} of {lesson.steps.length}
                        </div>
                        <h2 className="text-lg font-semibold text-neutral-900">{currentStep.title}</h2>
                        <p className="text-sm text-neutral-500 mt-1 leading-relaxed max-w-2xl">{currentStep.instruction}</p>
                      </>
                    ) : (
                      <>
                        <h2 className="text-lg font-semibold text-neutral-900">{lesson.title}</h2>
                        <p className="text-sm text-neutral-500 mt-1">Review mode — this lesson is complete. Explore the CMS Studio freely.</p>
                      </>
                    )}
                  </div>
                  {currentStep && (
                    <span className="text-[10px] px-2 py-1 bg-neutral-100 text-neutral-500 rounded-full whitespace-nowrap">
                      {currentStep.studioView.replace(/-/g, " ")} tab →
                    </span>
                  )}
                </div>
              </div>

              <div className="flex-1 p-6 overflow-hidden">
                <div className="h-full max-h-[calc(100vh-180px)]">
                  <CMSStudio onAction={checkStep} expectedAction={currentStep?.action} />
                </div>
              </div>
            </>
          ) : showMastery ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center py-20">
                <p className="text-4xl mb-4">🏆</p>
                <h2 className="text-2xl font-semibold">All CMS concepts mastered!</h2>
                <p className="text-neutral-500 mt-2">You&apos;ve explored content types, media, schema, roles, API, and more.</p>
                <button
                  onClick={() => setViewMode("explore")}
                  className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-neutral-900 text-white rounded-xl text-sm"
                >
                  Explore Your Website <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-neutral-400 text-sm">Select a lesson from the sidebar to begin.</p>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
