import { prisma } from "@/lib/prisma";
import type {
  CMSProviderInterface,
  ContentEntry,
  CreateContentInput,
  UpdateContentInput,
} from "@/modules/cms/types";
import { slugify } from "@/lib/utils";

function mapEntry(entry: {
  id: string;
  title: string;
  slug: string;
  author: string;
  image: string | null;
  content: string;
  category: string;
  status: string;
  locale: string;
  readingTime: number | null;
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date | null;
}): ContentEntry {
  return {
    ...entry,
    status: entry.status as ContentEntry["status"],
    createdAt: entry.createdAt.toISOString(),
    updatedAt: entry.updatedAt.toISOString(),
    publishedAt: entry.publishedAt?.toISOString() ?? null,
  };
}

export class DemoCMSProvider implements CMSProviderInterface {
  async listEntries(): Promise<ContentEntry[]> {
    const entries = await prisma.contentEntry.findMany({ orderBy: { updatedAt: "desc" } });
    return entries.map(mapEntry);
  }

  async getEntry(id: string): Promise<ContentEntry | null> {
    const entry = await prisma.contentEntry.findUnique({ where: { id } });
    return entry ? mapEntry(entry) : null;
  }

  async createEntry(input: CreateContentInput): Promise<ContentEntry> {
    const slug = input.slug || slugify(input.title);
    const entry = await prisma.contentEntry.create({
      data: {
        title: input.title,
        slug,
        author: input.author ?? "Sarah Chen",
        image: input.image ?? null,
        content: input.content ?? "",
        category: input.category ?? "Getting Started",
        status: input.status ?? "DRAFT",
        locale: input.locale ?? "en",
        readingTime: input.readingTime ?? null,
        publishedAt: input.status === "PUBLISHED" ? new Date() : null,
      },
    });
    return mapEntry(entry);
  }

  async updateEntry(id: string, input: UpdateContentInput): Promise<ContentEntry> {
    const existing = await prisma.contentEntry.findUnique({ where: { id } });
    if (!existing) throw new Error("Entry not found");

    const status = input.status ?? existing.status;
    const entry = await prisma.contentEntry.update({
      where: { id },
      data: {
        ...input,
        slug: input.slug ?? (input.title ? slugify(input.title) : undefined),
        publishedAt:
          status === "PUBLISHED" && existing.status !== "PUBLISHED"
            ? new Date()
            : status !== "PUBLISHED"
              ? null
              : existing.publishedAt,
      },
    });
    return mapEntry(entry);
  }

  async deleteEntry(id: string): Promise<void> {
    await prisma.contentEntry.delete({ where: { id } });
  }

  async validateConnection() {
    await prisma.contentEntry.count();
    return { ok: true };
  }

  async getSchemas() {
    return [
      { name: "Blog Post", fields: ["title", "slug", "author", "image", "content", "category", "status", "locale", "readingTime"] },
      { name: "Media Asset", fields: ["filename", "url", "mimeType", "size", "alt"] },
    ];
  }
}
