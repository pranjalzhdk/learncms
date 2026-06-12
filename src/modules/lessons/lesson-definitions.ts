import type { Lesson, WebsiteFeature, CMSConcept } from "@/modules/cms/types";

export const LESSONS: Lesson[] = [
  {
    slug: "content-types",
    title: "Content Types & Schema",
    description: "Understand how a CMS organizes different kinds of content.",
    concept: "architecture",
    xpReward: 75,
    badge: { slug: "architect", name: "Architect", icon: "🏛️" },
    unlocks: [],
    unlockMessage: "You understand CMS content architecture!",
    steps: [
      {
        id: "s1",
        title: "Explore content types",
        instruction: "Open the Content Types panel. A CMS defines structured models — Blog Posts, Products, Authors, Pages, and more. Each type has its own fields.",
        action: "explore-types",
        studioView: "content-types",
      },
      {
        id: "s2",
        title: "Inspect a schema",
        instruction: "Click on Blog Posts to see its field schema: title, slug, author, image, content, category, status. This schema drives both the CMS editor and the API response.",
        action: "inspect-schema",
        studioView: "content-types",
      },
    ],
  },
  {
    slug: "content-creation",
    title: "Create Content",
    description: "Create your first entry and save it to the CMS database.",
    concept: "content-lifecycle",
    xpReward: 100,
    badge: { slug: "content-creator", name: "Content Creator", icon: "✍️" },
    unlocks: ["blog-homepage"],
    unlockMessage: "Your website homepage is now live!",
    steps: [
      {
        id: "s1",
        title: "Create an entry",
        instruction: "In the Content Editor, create a new blog post with a title and body. This writes directly to your CMS database via the API.",
        action: "create-title",
        studioView: "editor",
      },
      {
        id: "s2",
        title: "Publish the entry",
        instruction: "Change status to Published. Draft content lives in the CMS and API but does NOT appear on the frontend until published.",
        action: "publish",
        studioView: "editor",
      },
    ],
  },
  {
    slug: "real-time-updates",
    title: "Real-Time API Sync",
    description: "See how CMS changes instantly flow through the API to the frontend.",
    concept: "api-layer",
    xpReward: 100,
    badge: { slug: "live-sync", name: "Live Sync", icon: "⚡" },
    unlocks: [],
    unlockMessage: "You understand real-time CMS sync!",
    steps: [
      {
        id: "s1",
        title: "Edit content",
        instruction: "Change a post title in the editor. Watch the Live API panel — you'll see PATCH request, JSON response, and frontend update events.",
        action: "edit-title",
        studioView: "editor",
      },
      {
        id: "s2",
        title: "Inspect the API",
        instruction: "Switch to the API Inspector tab. See the full JSON your frontend receives. This is exactly what any website, app, or IoT device would fetch.",
        action: "inspect-api",
        studioView: "api",
      },
    ],
  },
  {
    slug: "media-management",
    title: "Media Library",
    description: "Upload and manage assets in the CMS media library.",
    concept: "media",
    xpReward: 150,
    badge: { slug: "media-manager", name: "Media Manager", icon: "🖼️" },
    unlocks: ["hero-sections", "gallery"],
    unlockMessage: "Hero sections and image gallery unlocked!",
    steps: [
      {
        id: "s1",
        title: "Open media library",
        instruction: "Switch to the Media tab. CMS platforms store images, videos, and files separately from content entries — with metadata like alt text and file size.",
        action: "open-media",
        studioView: "media",
      },
      {
        id: "s2",
        title: "Add an asset",
        instruction: "Add an image URL to the media library, then assign it to a blog post in the editor. The image flows: Media Library → CMS Entry → API → Website.",
        action: "add-image",
        studioView: "media",
      },
    ],
  },
  {
    slug: "content-modeling",
    title: "Content Modeling",
    description: "Extend your schema with custom fields.",
    concept: "modeling",
    xpReward: 200,
    badge: { slug: "schema-architect", name: "Schema Architect", icon: "🏗️" },
    unlocks: ["custom-components"],
    unlockMessage: "Custom dynamic components unlocked!",
    steps: [
      {
        id: "s1",
        title: "Open schema builder",
        instruction: "Switch to Schema Builder. Content modeling is how you define WHAT data your CMS stores — without code changes to the database.",
        action: "open-modeling",
        studioView: "schema",
      },
      {
        id: "s2",
        title: "Add a custom field",
        instruction: 'Add a "Reading Time" number field to Blog Posts. The API response and frontend will include this new field automatically.',
        action: "add-field",
        studioView: "schema",
      },
    ],
  },
  {
    slug: "categories",
    title: "Taxonomy & Categories",
    description: "Organize content with categories and tags.",
    concept: "taxonomy",
    xpReward: 125,
    badge: { slug: "organizer", name: "Organizer", icon: "🏷️" },
    unlocks: ["category-filter", "navigation"],
    unlockMessage: "Category filtering and navigation unlocked!",
    steps: [
      {
        id: "s1",
        title: "Assign a category",
        instruction: "In the editor, set a category on your post. Taxonomies let you filter, navigate, and group content on the frontend.",
        action: "set-category",
        studioView: "editor",
      },
    ],
  },
  {
    slug: "authors",
    title: "References & Authors",
    description: "Link content to other content types using references.",
    concept: "references",
    xpReward: 125,
    badge: { slug: "team-builder", name: "Team Builder", icon: "👤" },
    unlocks: ["author-profiles"],
    unlockMessage: "Author profile pages unlocked!",
    steps: [
      {
        id: "s1",
        title: "Set an author reference",
        instruction: "Assign an author to your post. In headless CMS, authors are a separate content type referenced by blog posts — a core relational pattern.",
        action: "set-author",
        studioView: "editor",
      },
    ],
  },
  {
    slug: "localization",
    title: "Localization",
    description: "Publish content in multiple languages from one CMS.",
    concept: "localization",
    xpReward: 200,
    badge: { slug: "global-publisher", name: "Global Publisher", icon: "🌍" },
    unlocks: ["language-switcher"],
    unlockMessage: "Language switcher unlocked!",
    steps: [
      {
        id: "s1",
        title: "Set a locale",
        instruction: "Change the locale field to 'de' (German) or 'fr' (French). The CMS stores language variants — the frontend switches without separate databases.",
        action: "switch-locale",
        studioView: "editor",
      },
    ],
  },
  {
    slug: "seo",
    title: "SEO & Metadata",
    description: "Control how content appears in search engines.",
    concept: "seo",
    xpReward: 125,
    badge: { slug: "seo-expert", name: "SEO Expert", icon: "🔍" },
    unlocks: ["metadata-preview"],
    unlockMessage: "SEO metadata preview unlocked!",
    steps: [
      {
        id: "s1",
        title: "Add metadata",
        instruction: "Set a reading time value. SEO fields like reading time, meta descriptions, and OG tags are part of the content model — served via the same API.",
        action: "add-reading-time",
        studioView: "editor",
      },
    ],
  },
  {
    slug: "draft-publish",
    title: "Draft & Publish Workflow",
    description: "Master the content lifecycle from draft to live.",
    concept: "content-lifecycle",
    xpReward: 100,
    badge: { slug: "publisher", name: "Publisher", icon: "📤" },
    unlocks: [],
    unlockMessage: "You master the publish workflow!",
    steps: [
      {
        id: "s1",
        title: "Save as draft",
        instruction: "Set a post to Draft. It remains in the CMS and appears in the API response, but the frontend website does NOT show it.",
        action: "save-draft",
        studioView: "editor",
      },
      {
        id: "s2",
        title: "Publish to go live",
        instruction: "Publish the post. Watch the API status change and the frontend update instantly.",
        action: "publish",
        studioView: "editor",
      },
    ],
  },
  {
    slug: "permissions",
    title: "Roles & Permissions",
    description: "Control who can create, edit, and publish content.",
    concept: "permissions",
    xpReward: 150,
    badge: { slug: "access-control", name: "Access Control", icon: "🔐" },
    unlocks: [],
    unlockMessage: "You understand CMS access control!",
    steps: [
      {
        id: "s1",
        title: "Explore roles",
        instruction: "Open the Roles panel. CMS platforms define roles — Viewer (read-only), Editor (create/edit), Admin (full access). Each role restricts what users can do.",
        action: "explore-roles",
        studioView: "roles",
      },
      {
        id: "s2",
        title: "Switch to Viewer",
        instruction: "Switch to Viewer role and try to edit content. Notice how the editor becomes read-only — this is access control in action.",
        action: "change-role",
        studioView: "roles",
      },
    ],
  },
];

export function getLesson(slug: string) {
  return LESSONS.find((l) => l.slug === slug);
}

export function getUnlockedFeatures(completedLessons: string[]): WebsiteFeature[] {
  const features = new Set<WebsiteFeature>();
  LESSONS.forEach((l) => {
    if (completedLessons.includes(l.slug)) {
      l.unlocks.forEach((f) => features.add(f));
    }
  });
  return Array.from(features);
}

export function getNextLesson(completedLessons: string[]) {
  return LESSONS.find((l) => !completedLessons.includes(l.slug));
}

export function getLessonsByConcept(concept: CMSConcept) {
  return LESSONS.filter((l) => l.concept === concept);
}

export function getConceptProgress(concept: CMSConcept, completedLessons: string[]) {
  const lessons = getLessonsByConcept(concept);
  const done = lessons.filter((l) => completedLessons.includes(l.slug)).length;
  return { total: lessons.length, done };
}
