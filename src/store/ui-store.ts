"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";
import type {
  ApiLiveEvent,
  CMSConnectionConfig,
  CMSStudioView,
  ConnectionStats,
  SchemaField,
  ViewMode,
  WebsiteFeature,
  WebsiteTheme,
} from "@/modules/cms/types";
import { getUnlockedFeatures, getLesson, getNextLesson } from "@/modules/lessons/lesson-definitions";

interface UIState {
  // Connection — required before learning
  isConnected: boolean;
  cmsConfig: CMSConnectionConfig | null;
  connectionStats: ConnectionStats | null;
  isConnecting: boolean;
  connectionError: string | null;

  // View modes
  viewMode: ViewMode;
  xrayMode: boolean;
  showUnlockCelebration: boolean;
  lastUnlockMessage: string;

  // Website evolution
  activeTheme: WebsiteTheme;
  unlockedFeatures: WebsiteFeature[];
  activeLocale: string;

  // Lessons
  activeLessonSlug: string | null;
  activeStepIndex: number;
  completedLessons: string[];
  xp: number;
  earnedBadges: string[];

  // Editor
  editingEntryId: string | null;
  selectedEntryId: string | null;

  // CMS Studio
  activeStudioView: CMSStudioView;
  selectedContentType: string | null;
  schemaFields: SchemaField[];
  userRole: "viewer" | "editor" | "admin";
  hasExploredTypes: boolean;
  hasInspectedSchema: boolean;
  hasInspectedApi: boolean;

  // Live API events
  apiEvents: ApiLiveEvent[];

  // Actions
  connect: (config: CMSConnectionConfig, stats: ConnectionStats) => void;
  disconnect: () => void;
  setConnecting: (v: boolean) => void;
  setConnectionError: (error: string | null) => void;

  setViewMode: (mode: ViewMode) => void;
  setXrayMode: (on: boolean) => void;
  setActiveTheme: (theme: WebsiteTheme) => void;
  setActiveLocale: (locale: string) => void;

  setActiveLesson: (slug: string | null) => void;
  setActiveStep: (index: number) => void;
  nextStep: () => void;
  completeLesson: (slug: string, xp: number, badge: string, unlocks: WebsiteFeature[], message: string) => void;
  dismissCelebration: () => void;

  setEditingEntryId: (id: string | null) => void;
  setSelectedEntryId: (id: string | null) => void;

  setActiveStudioView: (view: CMSStudioView) => void;
  setSelectedContentType: (id: string | null) => void;
  addSchemaField: (field: Omit<SchemaField, "id">) => void;
  setUserRole: (role: "viewer" | "editor" | "admin") => void;
  markExploredTypes: () => void;
  markInspectedSchema: () => void;
  markInspectedApi: () => void;

  logApiEvent: (event: Omit<ApiLiveEvent, "id" | "timestamp">) => void;
  clearApiEvents: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      isConnected: false,
      cmsConfig: null,
      connectionStats: null,
      isConnecting: false,
      connectionError: null,

      viewMode: "connect",
      xrayMode: false,
      showUnlockCelebration: false,
      lastUnlockMessage: "",

      activeTheme: "modern-startup",
      unlockedFeatures: [],
      activeLocale: "en",

      activeLessonSlug: null,
      activeStepIndex: 0,
      completedLessons: [],
      xp: 0,
      earnedBadges: [],

      editingEntryId: null,
      selectedEntryId: null,

      activeStudioView: "content-types",
      selectedContentType: null,
      schemaFields: [],
      userRole: "admin",
      hasExploredTypes: false,
      hasInspectedSchema: false,
      hasInspectedApi: false,

      apiEvents: [],

      connect: (config, stats) => {
        const state = get();
        const isFirstConnect = !state.completedLessons.length && !state.activeLessonSlug;
        set({
          isConnected: true,
          cmsConfig: config,
          connectionStats: stats,
          connectionError: null,
          viewMode: "learn",
          ...(isFirstConnect
            ? { activeLessonSlug: "content-types", activeStepIndex: 0 }
            : {}),
        });
      },

      disconnect: () =>
        set({
          isConnected: false,
          cmsConfig: null,
          connectionStats: null,
          viewMode: "connect",
          unlockedFeatures: [],
          completedLessons: [],
          activeLessonSlug: null,
          activeStepIndex: 0,
          xp: 0,
          earnedBadges: [],
          schemaFields: [],
          userRole: "admin",
          apiEvents: [],
          showUnlockCelebration: false,
          editingEntryId: null,
          selectedEntryId: null,
        }),

      setConnecting: (v) => set({ isConnecting: v }),
      setConnectionError: (error) => set({ connectionError: error }),

      setViewMode: (mode) => set({ viewMode: mode }),
      setXrayMode: (on) => set({ xrayMode: on }),
      setActiveTheme: (theme) => set({ activeTheme: theme }),
      setActiveLocale: (locale) => set({ activeLocale: locale }),

      setActiveLesson: (slug) => {
        const lesson = slug ? getLesson(slug) : null;
        const view = lesson?.steps[0]?.studioView ?? "editor";
        set({ activeLessonSlug: slug, activeStepIndex: 0, activeStudioView: view });
      },
      setActiveStep: (index) => set({ activeStepIndex: index }),
      nextStep: () => {
        const { activeLessonSlug, activeStepIndex } = get();
        const lesson = activeLessonSlug ? getLesson(activeLessonSlug) : null;
        const nextIndex = activeStepIndex + 1;
        const nextView = lesson?.steps[nextIndex]?.studioView;
        set({
          activeStepIndex: nextIndex,
          ...(nextView ? { activeStudioView: nextView } : {}),
        });
      },

      completeLesson: (slug, xp, badge, unlocks, message) => {
        const completed = get().completedLessons.includes(slug)
          ? get().completedLessons
          : [...get().completedLessons, slug];
        const next = getNextLesson(completed);
        set({
          xp: get().xp + xp,
          earnedBadges: get().earnedBadges.includes(badge) ? get().earnedBadges : [...get().earnedBadges, badge],
          completedLessons: completed,
          unlockedFeatures: getUnlockedFeatures(completed),
          showUnlockCelebration: true,
          lastUnlockMessage: message,
          activeLessonSlug: next?.slug ?? null,
          activeStepIndex: 0,
          viewMode: unlocks.length > 0 ? "explore" : "learn",
          ...(next ? { activeStudioView: next.steps[0]?.studioView ?? "editor" } : {}),
        });
      },

      dismissCelebration: () => set({ showUnlockCelebration: false }),

      setEditingEntryId: (id) => set({ editingEntryId: id }),
      setSelectedEntryId: (id) => set({ selectedEntryId: id }),

      setActiveStudioView: (view) => set({ activeStudioView: view }),
      setSelectedContentType: (id) => set({ selectedContentType: id }),
      addSchemaField: (field) =>
        set((s) => ({
          schemaFields: [...s.schemaFields, { ...field, id: uuidv4() }],
        })),
      setUserRole: (role) => set({ userRole: role }),
      markExploredTypes: () => set({ hasExploredTypes: true }),
      markInspectedSchema: () => set({ hasInspectedSchema: true }),
      markInspectedApi: () => set({ hasInspectedApi: true }),

      logApiEvent: (event) =>
        set((s) => ({
          apiEvents: [
            { ...event, id: uuidv4(), timestamp: new Date().toISOString() },
            ...s.apiEvents,
          ].slice(0, 30),
        })),

      clearApiEvents: () => set({ apiEvents: [] }),
    }),
    {
      name: "learncms-world",
      skipHydration: true,
      partialize: (s) => ({
        isConnected: s.isConnected,
        cmsConfig: s.cmsConfig,
        connectionStats: s.connectionStats,
        activeTheme: s.activeTheme,
        completedLessons: s.completedLessons,
        unlockedFeatures: s.unlockedFeatures,
        xp: s.xp,
        earnedBadges: s.earnedBadges,
        activeLessonSlug: s.activeLessonSlug,
        activeStepIndex: s.activeStepIndex,
        schemaFields: s.schemaFields,
        userRole: s.userRole,
      }),
    }
  )
);
