export type CMSProviderType = "demo" | "sanity" | "contentful" | "strapi" | "hygraph" | "custom";

export type EntryStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export type WebsiteTheme =
  | "modern-startup"
  | "news-magazine"
  | "ecommerce"
  | "portfolio"
  | "travel-blog"
  | "saas-landing";

export type WebsiteFeature =
  | "blog-homepage"
  | "hero-sections"
  | "gallery"
  | "category-filter"
  | "navigation"
  | "author-profiles"
  | "language-switcher"
  | "metadata-preview"
  | "custom-components";

export type ViewMode = "connect" | "learn" | "explore";

export interface ContentEntry {
  id: string;
  title: string;
  slug: string;
  author: string;
  image: string | null;
  content: string;
  category: string;
  status: EntryStatus;
  locale: string;
  readingTime: number | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

export interface CreateContentInput {
  title: string;
  slug?: string;
  author?: string;
  image?: string | null;
  content?: string;
  category?: string;
  status?: EntryStatus;
  locale?: string;
  readingTime?: number | null;
}

export interface UpdateContentInput extends Partial<CreateContentInput> {}

export interface CMSConnectionConfig {
  provider: CMSProviderType;
  projectId?: string;
  dataset?: string;
  apiToken?: string;
  apiUrl?: string;
}

export interface ConnectionStats {
  provider: CMSProviderType;
  entryCount: number;
  contentTypeCount: number;
  lastSync: string;
  schemas: { name: string; fields: string[] }[];
}

export interface CMSProviderInterface {
  listEntries(): Promise<ContentEntry[]>;
  getEntry(id: string): Promise<ContentEntry | null>;
  createEntry(input: CreateContentInput): Promise<ContentEntry>;
  updateEntry(id: string, input: UpdateContentInput): Promise<ContentEntry>;
  deleteEntry(id: string): Promise<void>;
  validateConnection(): Promise<{ ok: boolean; error?: string }>;
  getSchemas?(): Promise<{ name: string; fields: string[] }[]>;
}

export interface ApiLiveEvent {
  id: string;
  phase: "cms-change" | "request" | "response" | "frontend-update";
  method?: string;
  endpoint?: string;
  status?: number;
  duration?: number;
  payload?: unknown;
  timestamp: string;
}

export type CMSStudioView =
  | "content-types"
  | "editor"
  | "media"
  | "schema"
  | "roles"
  | "api";

export type CMSConcept =
  | "architecture"
  | "content-lifecycle"
  | "media"
  | "modeling"
  | "taxonomy"
  | "references"
  | "localization"
  | "seo"
  | "permissions"
  | "api-layer";

export interface SchemaField {
  id: string;
  name: string;
  slug: string;
  fieldType: string;
  contentType: string;
}

export interface MediaAsset {
  id: string;
  filename: string;
  url: string;
  mimeType: string;
  size: number;
  alt?: string;
}

export interface LessonStep {
  id: string;
  title: string;
  instruction: string;
  action: string;
  studioView: CMSStudioView;
}

export interface Lesson {
  slug: string;
  title: string;
  description: string;
  concept: CMSConcept;
  xpReward: number;
  badge: { slug: string; name: string; icon: string };
  unlocks: WebsiteFeature[];
  unlockMessage: string;
  steps: LessonStep[];
}

export interface SyncEvent {
  type: "content.created" | "content.updated" | "content.deleted" | "content.published";
  payload: { id: string; timestamp: number };
}

export const WEBSITE_THEMES: { id: WebsiteTheme; name: string; description: string }[] = [
  { id: "modern-startup", name: "Modern Startup", description: "Clean SaaS-style layout" },
  { id: "news-magazine", name: "News Magazine", description: "Editorial grid with headlines" },
  { id: "ecommerce", name: "Ecommerce Store", description: "Product-focused storefront" },
  { id: "portfolio", name: "Portfolio", description: "Minimal creative showcase" },
  { id: "travel-blog", name: "Travel Blog", description: "Immersive photo-driven stories" },
  { id: "saas-landing", name: "SaaS Landing Page", description: "Conversion-focused hero" },
];

export const PROVIDER_META: Record<
  CMSProviderType,
  { name: string; color: string; description: string }
> = {
  sanity: { name: "Sanity", color: "#F03E2F", description: "Structured content platform" },
  contentful: { name: "Contentful", color: "#2478CC", description: "Enterprise headless CMS" },
  strapi: { name: "Strapi", color: "#4945FF", description: "Open-source Node.js CMS" },
  hygraph: { name: "Hygraph", color: "#090A23", description: "GraphQL-native CMS" },
  custom: { name: "Generic REST API", color: "#6366f1", description: "Any REST-compatible CMS" },
  demo: { name: "Demo Mode", color: "#737373", description: "Local database for testing" },
};
