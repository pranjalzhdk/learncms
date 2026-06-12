import type {
  CMSConnectionConfig,
  CMSProviderInterface,
  ContentEntry,
  CreateContentInput,
  UpdateContentInput,
} from "@/modules/cms/types";

export class SanityCMSProvider implements CMSProviderInterface {
  constructor(private config: CMSConnectionConfig) {}

  private get baseUrl() {
    const dataset = this.config.dataset || "production";
    return `https://${this.config.projectId}.api.sanity.io/v2021-10-21/data/query/${dataset}`;
  }

  private headers() {
    const h: Record<string, string> = { "Content-Type": "application/json" };
    if (this.config.apiToken) h.Authorization = `Bearer ${this.config.apiToken}`;
    return h;
  }

  async validateConnection() {
    if (!this.config.projectId) return { ok: false, error: "Project ID required" };
    try {
      const res = await fetch(
        `${this.baseUrl}?query=${encodeURIComponent('*[_type == "post"][0..1]{_id, title}')}`,
        { headers: this.headers(), next: { revalidate: 0 } }
      );
      if (!res.ok) return { ok: false, error: `Sanity API error: ${res.status}` };
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : "Connection failed" };
    }
  }

  private mapDoc(doc: Record<string, unknown>): ContentEntry {
    return {
      id: String(doc._id ?? doc.id ?? ""),
      title: String(doc.title ?? "Untitled"),
      slug: String((doc.slug as { current?: string })?.current ?? doc.slug ?? slugify(String(doc.title ?? "untitled"))),
      author: String(doc.author ?? "Unknown"),
      image: doc.image ? String((doc.image as { url?: string }).url ?? doc.image) : null,
      content: String(doc.body ?? doc.content ?? ""),
      category: String(doc.category ?? "General"),
      status: doc.publishedAt ? "PUBLISHED" : "DRAFT",
      locale: String(doc.locale ?? "en"),
      readingTime: typeof doc.readingTime === "number" ? doc.readingTime : null,
      createdAt: String(doc._createdAt ?? new Date().toISOString()),
      updatedAt: String(doc._updatedAt ?? new Date().toISOString()),
      publishedAt: doc.publishedAt ? String(doc.publishedAt) : null,
    };
  }

  async listEntries(): Promise<ContentEntry[]> {
    const query = '*[_type == "post"] | order(_updatedAt desc) { _id, title, "slug": slug.current, author, body, category, publishedAt, _createdAt, _updatedAt }';
    const res = await fetch(`${this.baseUrl}?query=${encodeURIComponent(query)}`, {
      headers: this.headers(),
      next: { revalidate: 0 },
    });
    if (!res.ok) throw new Error(`Sanity fetch failed: ${res.status}`);
    const json = await res.json();
    return (json.result ?? []).map((doc: Record<string, unknown>) => this.mapDoc(doc));
  }

  async getEntry(id: string) {
    const entries = await this.listEntries();
    return entries.find((e) => e.id === id) ?? null;
  }

  async createEntry(input: CreateContentInput): Promise<ContentEntry> {
    if (!this.config.apiToken) {
      throw new Error("Sanity API token with write access required");
    }
    const dataset = this.config.dataset || "production";
    const mutateUrl = `https://${this.config.projectId}.api.sanity.io/v2021-06-07/data/mutate/${dataset}`;
    const slug = input.slug || slugify(input.title);
    const doc = {
      _type: "post",
      title: input.title,
      slug: { _type: "slug", current: slug },
      body: input.content ?? "",
      author: input.author ?? "Unknown",
      category: input.category ?? "General",
    };
    const res = await fetch(mutateUrl, {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify({ mutations: [{ create: doc }] }),
    });
    if (!res.ok) throw new Error(`Sanity create failed: ${res.status}`);
    const json = await res.json();
    const id = json.results?.[0]?.id ?? json.documentId;
    const created = id ? await this.getEntry(id) : null;
    if (created) return created;
    return {
      id: id ?? `sanity-${Date.now()}`,
      title: input.title,
      slug,
      author: input.author ?? "Unknown",
      image: input.image ?? null,
      content: input.content ?? "",
      category: input.category ?? "General",
      status: input.status ?? "DRAFT",
      locale: input.locale ?? "en",
      readingTime: input.readingTime ?? null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publishedAt: null,
    };
  }

  async updateEntry(id: string, input: UpdateContentInput): Promise<ContentEntry> {
    if (!this.config.apiToken) {
      throw new Error("Sanity API token with write access required");
    }
    const dataset = this.config.dataset || "production";
    const mutateUrl = `https://${this.config.projectId}.api.sanity.io/v2021-06-07/data/mutate/${dataset}`;
    const patch: Record<string, unknown> = {};
    if (input.title) patch.title = input.title;
    if (input.content) patch.body = input.content;
    if (input.author) patch.author = input.author;
    if (input.category) patch.category = input.category;
    if (input.slug) patch.slug = { _type: "slug", current: input.slug };

    const res = await fetch(mutateUrl, {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify({ mutations: [{ patch: { id, set: patch } }] }),
    });
    if (!res.ok) throw new Error(`Sanity update failed: ${res.status}`);
    const updated = await this.getEntry(id);
    if (updated) return updated;
    throw new Error("Failed to fetch updated Sanity document");
  }

  async deleteEntry(id: string): Promise<void> {
    if (!this.config.apiToken) throw new Error("Sanity API token required");
    const dataset = this.config.dataset || "production";
    const mutateUrl = `https://${this.config.projectId}.api.sanity.io/v2021-06-07/data/mutate/${dataset}`;
    const res = await fetch(mutateUrl, {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify({ mutations: [{ delete: { id } }] }),
    });
    if (!res.ok) throw new Error(`Sanity delete failed: ${res.status}`);
  }
}

function slugify(text: string) {
  return text.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");
}

export class ContentfulCMSProvider implements CMSProviderInterface {
  constructor(private config: CMSConnectionConfig) {}

  async validateConnection() {
    if (!this.config.projectId) return { ok: false, error: "Space ID required" };
    try {
      const url = `https://cdn.contentful.com/spaces/${this.config.projectId}/entries?limit=1&access_token=${this.config.apiToken}`;
      const res = await fetch(url, { next: { revalidate: 0 } });
      if (!res.ok) return { ok: false, error: `Contentful API error: ${res.status}` };
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : "Connection failed" };
    }
  }

  async listEntries(): Promise<ContentEntry[]> {
    const url = `https://cdn.contentful.com/spaces/${this.config.projectId}/entries?content_type=blogPost&access_token=${this.config.apiToken}`;
    const res = await fetch(url, { next: { revalidate: 0 } });
    if (!res.ok) throw new Error(`Contentful fetch failed: ${res.status}`);
    const json = await res.json();
    return (json.items ?? []).map((item: Record<string, unknown>) => {
      const fields = item.fields as Record<string, unknown>;
      return {
        id: String((item.sys as Record<string, string>)?.id ?? ""),
        title: String(fields.title ?? "Untitled"),
        slug: String(fields.slug ?? ""),
        author: String(fields.author ?? "Unknown"),
        image: null,
        content: String(fields.content ?? ""),
        category: String(fields.category ?? "General"),
        status: "PUBLISHED" as const,
        locale: "en",
        readingTime: null,
        createdAt: String((item.sys as Record<string, string>)?.createdAt ?? ""),
        updatedAt: String((item.sys as Record<string, string>)?.updatedAt ?? ""),
        publishedAt: String((item.sys as Record<string, string>)?.createdAt ?? ""),
      };
    });
  }

  async getEntry(id: string) {
    const entries = await this.listEntries();
    return entries.find((e) => e.id === id) ?? null;
  }

  async createEntry(_input: CreateContentInput): Promise<ContentEntry> {
    throw new Error("Contentful write requires Management API token.");
  }

  async updateEntry(_id: string, _input: UpdateContentInput): Promise<ContentEntry> {
    throw new Error("Contentful write requires Management API token.");
  }

  async deleteEntry(_id: string): Promise<void> {
    throw new Error("Contentful delete requires Management API token.");
  }
}

export class StrapiCMSProvider implements CMSProviderInterface {
  constructor(private config: CMSConnectionConfig) {}

  private get baseUrl() {
    return (this.config.apiUrl ?? "").replace(/\/$/, "");
  }

  private headers() {
    const h: Record<string, string> = { "Content-Type": "application/json" };
    if (this.config.apiToken) h.Authorization = `Bearer ${this.config.apiToken}`;
    return h;
  }

  async validateConnection() {
    if (!this.config.apiUrl) return { ok: false, error: "API URL required" };
    try {
      const res = await fetch(`${this.baseUrl}/api/posts?pagination[limit]=1`, {
        headers: this.headers(),
        next: { revalidate: 0 },
      });
      if (!res.ok) return { ok: false, error: `Strapi API error: ${res.status}` };
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : "Connection failed" };
    }
  }

  async listEntries(): Promise<ContentEntry[]> {
    const res = await fetch(`${this.baseUrl}/api/posts?populate=*`, {
      headers: this.headers(),
      next: { revalidate: 0 },
    });
    if (!res.ok) throw new Error(`Strapi fetch failed: ${res.status}`);
    const json = await res.json();
    return (json.data ?? []).map((item: Record<string, unknown>) => {
      const attrs = item.attributes as Record<string, unknown>;
      return {
        id: String(item.id),
        title: String(attrs.title ?? "Untitled"),
        slug: String(attrs.slug ?? ""),
        author: String((attrs.author as Record<string, string>)?.name ?? "Unknown"),
        image: null,
        content: String(attrs.content ?? ""),
        category: String(attrs.category ?? "General"),
        status: attrs.publishedAt ? "PUBLISHED" : "DRAFT",
        locale: "en",
        readingTime: null,
        createdAt: String(attrs.createdAt ?? ""),
        updatedAt: String(attrs.updatedAt ?? ""),
        publishedAt: attrs.publishedAt ? String(attrs.publishedAt) : null,
      };
    });
  }

  async getEntry(id: string) {
    const res = await fetch(`${this.baseUrl}/api/posts/${id}?populate=*`, {
      headers: this.headers(),
      next: { revalidate: 0 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    const item = json.data;
    const attrs = item.attributes as Record<string, unknown>;
    return {
      id: String(item.id),
      title: String(attrs.title ?? ""),
      slug: String(attrs.slug ?? ""),
      author: "Unknown",
      image: null,
      content: String(attrs.content ?? ""),
      category: "General",
      status: (attrs.publishedAt ? "PUBLISHED" : "DRAFT") as "DRAFT" | "PUBLISHED",
      locale: "en",
      readingTime: null,
      createdAt: String(attrs.createdAt ?? ""),
      updatedAt: String(attrs.updatedAt ?? ""),
      publishedAt: attrs.publishedAt ? String(attrs.publishedAt) : null,
    };
  }

  async createEntry(input: CreateContentInput): Promise<ContentEntry> {
    const res = await fetch(`${this.baseUrl}/api/posts`, {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify({ data: input }),
    });
    if (!res.ok) throw new Error(`Strapi create failed: ${res.status}`);
    const entry = await this.getEntry((await res.json()).data.id);
    if (!entry) throw new Error("Failed to fetch created entry");
    return entry;
  }

  async updateEntry(id: string, input: UpdateContentInput): Promise<ContentEntry> {
    const res = await fetch(`${this.baseUrl}/api/posts/${id}`, {
      method: "PUT",
      headers: this.headers(),
      body: JSON.stringify({ data: input }),
    });
    if (!res.ok) throw new Error(`Strapi update failed: ${res.status}`);
    const entry = await this.getEntry(id);
    if (!entry) throw new Error("Failed to fetch updated entry");
    return entry;
  }

  async deleteEntry(id: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}/api/posts/${id}`, {
      method: "DELETE",
      headers: this.headers(),
    });
    if (!res.ok) throw new Error(`Strapi delete failed: ${res.status}`);
  }
}

export class HygraphCMSProvider implements CMSProviderInterface {
  constructor(private config: CMSConnectionConfig) {}

  async validateConnection() {
    if (!this.config.apiUrl || !this.config.apiToken) {
      return { ok: false, error: "Hygraph endpoint and token required" };
    }
    try {
      const res = await fetch(this.config.apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.config.apiToken}`,
        },
        body: JSON.stringify({ query: "{ __typename }" }),
        next: { revalidate: 0 },
      });
      if (!res.ok) return { ok: false, error: `Hygraph API error: ${res.status}` };
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : "Connection failed" };
    }
  }

  async listEntries(): Promise<ContentEntry[]> {
    const query = `{ posts { id title slug content author { name } } }`;
    const res = await fetch(this.config.apiUrl!, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.config.apiToken}`,
      },
      body: JSON.stringify({ query }),
      next: { revalidate: 0 },
    });
    if (!res.ok) throw new Error(`Hygraph fetch failed: ${res.status}`);
    const json = await res.json();
    return (json.data?.posts ?? []).map((p: Record<string, unknown>) => ({
      id: String(p.id),
      title: String(p.title ?? ""),
      slug: String(p.slug ?? ""),
      author: String((p.author as Record<string, string>)?.name ?? "Unknown"),
      image: null,
      content: String(p.content ?? ""),
      category: "General",
      status: "PUBLISHED" as const,
      locale: "en",
      readingTime: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publishedAt: new Date().toISOString(),
    }));
  }

  async getEntry(id: string) {
    const entries = await this.listEntries();
    return entries.find((e) => e.id === id) ?? null;
  }

  async createEntry(_input: CreateContentInput): Promise<ContentEntry> {
    throw new Error("Hygraph write requires mutation with appropriate permissions.");
  }

  async updateEntry(_id: string, _input: UpdateContentInput): Promise<ContentEntry> {
    throw new Error("Hygraph write requires mutation API.");
  }

  async deleteEntry(_id: string): Promise<void> {
    throw new Error("Hygraph delete requires mutation API.");
  }
}
