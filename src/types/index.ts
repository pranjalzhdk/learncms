export type FieldType =
  | "text"
  | "richtext"
  | "image"
  | "number"
  | "date"
  | "boolean"
  | "reference"
  | "slug"
  | "select";

export type EntryStatus = "draft" | "published" | "archived";

export type CMSProvider =
  | "sanity"
  | "contentful"
  | "strapi"
  | "hygraph"
  | "custom";

export type UserRole = "viewer" | "editor" | "admin";

export type FrontendPage =
  | "home"
  | "blog"
  | "article"
  | "products"
  | "about";

export type ApiTab = "rest" | "graphql" | "raw";

export type ContentTypeSlug =
  | "blog-posts"
  | "products"
  | "authors"
  | "pages"
  | "categories"
  | "media"
  | "users"
  | "modeling";

export interface ContentField {
  id: string;
  name: string;
  slug: string;
  fieldType: FieldType;
  required: boolean;
  order: number;
  config?: Record<string, unknown>;
}

export interface ContentType {
  id: string;
  slug: ContentTypeSlug;
  name: string;
  icon: string;
  fields: ContentField[];
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  author: string;
  image: string;
  content: string;
  category: string;
  status: EntryStatus;
  readingTime?: number;
  locale: string;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  image: string;
  description: string;
  status: EntryStatus;
}

export interface Author {
  id: string;
  name: string;
  bio: string;
  avatar: string;
}

export interface MediaAsset {
  id: string;
  filename: string;
  url: string;
  mimeType: string;
  size: number;
  alt?: string;
}

export interface ApiRequest {
  id: string;
  method: string;
  endpoint: string;
  status: number;
  timestamp: string;
  duration: number;
}

export interface Lesson {
  id: string;
  slug: string;
  title: string;
  description: string;
  order: number;
  xpReward: number;
  badge: Badge;
  tasks: LessonTask[];
  completed: boolean;
  progress: number;
}

export interface LessonTask {
  id: string;
  description: string;
  completed: boolean;
  hint?: string;
}

export interface Badge {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  earned: boolean;
  earnedAt?: string;
}

export interface CMSConnection {
  id: string;
  provider: CMSProvider;
  projectId?: string;
  dataset?: string;
  apiToken?: string;
  apiUrl?: string;
  isConnected: boolean;
  lastSync?: string;
}

export interface Analytics {
  contentCreated: number;
  fieldsAdded: number;
  apiRequests: number;
  publishedContent: number;
  lessonsCompleted: number;
  xpEarned: number;
}

export interface FlowEvent {
  id: string;
  source: "cms" | "api" | "frontend";
  target: "cms" | "api" | "frontend";
  timestamp: number;
  data?: unknown;
}

export interface Locale {
  code: string;
  name: string;
  flag: string;
  isDefault: boolean;
}

export const LEVELS = [
  { level: 1, name: "Beginner CMS User", xpRequired: 0 },
  { level: 2, name: "Content Manager", xpRequired: 500 },
  { level: 3, name: "CMS Architect", xpRequired: 1500 },
  { level: 4, name: "Headless Expert", xpRequired: 3000 },
  { level: 5, name: "CMS Master", xpRequired: 5000 },
] as const;
