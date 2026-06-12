import { NextResponse } from "next/server";
import { createCMSProvider } from "@/lib/cms/provider-factory";
import type { CMSConnectionConfig, ConnectionStats } from "@/modules/cms/types";

export const dynamic = "force-dynamic";

const DEFAULT_SCHEMAS = [
  { name: "Blog Post", fields: ["title", "slug", "author", "image", "content", "category", "status", "locale"] },
  { name: "Media", fields: ["filename", "url", "mimeType", "alt"] },
];

export async function POST(request: Request) {
  try {
    const config = (await request.json()) as CMSConnectionConfig;
    const provider = createCMSProvider(config);
    const result = await provider.validateConnection();

    if (!result.ok) {
      return NextResponse.json({ error: result.error ?? "Connection failed" }, { status: 401 });
    }

    const entries = await provider.listEntries();
    const schemas = provider.getSchemas ? await provider.getSchemas() : DEFAULT_SCHEMAS;

    const categories = new Set(entries.map((e) => e.category));
    const stats: ConnectionStats = {
      provider: config.provider,
      entryCount: entries.length,
      contentTypeCount: schemas.length,
      lastSync: new Date().toISOString(),
      schemas,
    };

    return NextResponse.json({
      success: true,
      stats,
      message: `Connected to ${config.provider} — ${entries.length} entries, ${categories.size} categories`,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Connection failed";
    const friendly = msg.includes("postgresql://") || msg.includes("postgres://")
      ? "Database not configured. Set DATABASE_URL to your Postgres connection string (e.g. from Neon)."
      : msg;
    return NextResponse.json({ error: friendly }, { status: 500 });
  }
}
