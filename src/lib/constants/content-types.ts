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

export interface ContentTypeDef {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  fields: string[];
}

export const CONTENT_TYPES: ContentTypeDef[] = [
  {
    id: "blog-posts",
    name: "Blog Posts",
    slug: "blog-posts",
    icon: "📝",
    description: "Articles with title, body, author, and publish status",
    fields: ["title", "slug", "author", "image", "content", "category", "status"],
  },
  {
    id: "products",
    name: "Products",
    slug: "products",
    icon: "🛍️",
    description: "E-commerce items with price, images, and descriptions",
    fields: ["name", "slug", "price", "image", "description", "status"],
  },
  {
    id: "authors",
    name: "Authors",
    slug: "authors",
    icon: "👤",
    description: "People who create content — referenced by blog posts",
    fields: ["name", "bio", "avatar", "email"],
  },
  {
    id: "pages",
    name: "Pages",
    slug: "pages",
    icon: "📄",
    description: "Static pages like About, Contact, Landing pages",
    fields: ["title", "slug", "content", "status"],
  },
  {
    id: "categories",
    name: "Categories",
    slug: "categories",
    icon: "🏷️",
    description: "Taxonomy for organizing and filtering content",
    fields: ["name", "slug", "description"],
  },
  {
    id: "media",
    name: "Media",
    slug: "media",
    icon: "🖼️",
    description: "Images, videos, and files stored in the media library",
    fields: ["filename", "url", "mimeType", "alt", "size"],
  },
  {
    id: "users",
    name: "Users",
    slug: "users",
    icon: "🔐",
    description: "CMS users with roles that control access",
    fields: ["name", "email", "role"],
  },
];

export const FIELD_TYPES = [
  { id: "text", label: "Text" },
  { id: "richtext", label: "Rich Text" },
  { id: "image", label: "Image" },
  { id: "number", label: "Number" },
  { id: "date", label: "Date" },
  { id: "boolean", label: "Boolean" },
  { id: "reference", label: "Reference" },
  { id: "select", label: "Select" },
] as const;

export const CMS_CONCEPTS: { id: CMSConcept; label: string; description: string }[] = [
  { id: "architecture", label: "CMS Architecture", description: "Content types, schemas, and structure" },
  { id: "content-lifecycle", label: "Content Lifecycle", description: "Create, edit, draft, and publish" },
  { id: "media", label: "Media Library", description: "Upload and manage assets" },
  { id: "modeling", label: "Content Modeling", description: "Design custom fields and schemas" },
  { id: "taxonomy", label: "Taxonomy", description: "Categories and organization" },
  { id: "references", label: "References", description: "Relational content and authors" },
  { id: "localization", label: "Localization", description: "Multi-language content" },
  { id: "seo", label: "SEO & Metadata", description: "Search and social metadata" },
  { id: "permissions", label: "Permissions", description: "Roles and access control" },
  { id: "api-layer", label: "API Layer", description: "REST, JSON, and real-time sync" },
];
