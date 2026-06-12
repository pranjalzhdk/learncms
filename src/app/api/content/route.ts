import { NextRequest, NextResponse } from "next/server";
import { createCMSProvider, parseCMSConfig } from "@/lib/cms/provider-factory";
import { broadcastSync } from "@/lib/sync-bus";
import type { CreateContentInput } from "@/modules/cms/types";

export async function GET(request: NextRequest) {
  try {
    const config = parseCMSConfig(request.headers);
    const provider = createCMSProvider(config);
    const entries = await provider.listEntries();
    return NextResponse.json({ data: entries, meta: { total: entries.length } });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch content" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CreateContentInput;
    const config = parseCMSConfig(request.headers);
    const provider = createCMSProvider(config);

    const entry = await provider.createEntry(body);
    broadcastSync({ type: "content.created", payload: { id: entry.id, timestamp: Date.now() } });
    return NextResponse.json({ data: entry }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create content" },
      { status: 500 }
    );
  }
}
