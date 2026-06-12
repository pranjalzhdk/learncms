import type {
  CMSProviderInterface,
  ContentEntry,
  CreateContentInput,
  UpdateContentInput,
} from "@/modules/cms/types";
import { DemoCMSProvider } from "./demo-provider";

/**
 * Reads from the connected CMS. Writes try the connected CMS first,
 * then fall back to the local database so learning challenges always work.
 */
export class WriteFallbackProvider implements CMSProviderInterface {
  private fallback = new DemoCMSProvider();

  constructor(private primary: CMSProviderInterface) {}

  async listEntries(): Promise<ContentEntry[]> {
    const [primaryEntries, fallbackEntries] = await Promise.all([
      this.primary.listEntries().catch(() => [] as ContentEntry[]),
      this.fallback.listEntries().catch(() => [] as ContentEntry[]),
    ]);

    const merged = new Map<string, ContentEntry>();
    fallbackEntries.forEach((e) => merged.set(e.id, e));
    primaryEntries.forEach((e) => merged.set(e.id, e));

    return Array.from(merged.values()).sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  async getEntry(id: string) {
    const primary = await this.primary.getEntry(id).catch(() => null);
    if (primary) return primary;
    return this.fallback.getEntry(id);
  }

  async getSchemas() {
    if (this.primary.getSchemas) return this.primary.getSchemas();
    return this.fallback.getSchemas!();
  }

  validateConnection() {
    return this.primary.validateConnection();
  }

  async createEntry(input: CreateContentInput) {
    try {
      return await this.primary.createEntry(input);
    } catch {
      return this.fallback.createEntry(input);
    }
  }

  async updateEntry(id: string, input: UpdateContentInput) {
    try {
      return await this.primary.updateEntry(id, input);
    } catch {
      const local = await this.fallback.getEntry(id);
      if (local) return this.fallback.updateEntry(id, input);
      // External entry — persist edits locally
      return this.fallback.createEntry({
        title: input.title ?? "Untitled",
        slug: input.slug,
        author: input.author,
        image: input.image,
        content: input.content,
        category: input.category,
        status: input.status,
        locale: input.locale,
        readingTime: input.readingTime,
      });
    }
  }

  async deleteEntry(id: string) {
    try {
      await this.primary.deleteEntry(id);
    } catch {
      await this.fallback.deleteEntry(id).catch(() => {});
    }
  }
}
