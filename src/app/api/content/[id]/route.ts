import { NextRequest, NextResponse } from "next/server";
import { createCMSProvider, parseCMSConfig } from "@/lib/cms/provider-factory";
import { broadcastSync } from "@/lib/sync-bus";
import type { UpdateContentInput } from "@/modules/cms/types";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const config = parseCMSConfig(request.headers);
    const provider = createCMSProvider(config);
    const entry = await provider.getEntry(id);
    if (!entry) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ data: entry });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch entry" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = (await request.json()) as UpdateContentInput;
    const config = parseCMSConfig(request.headers);
    const provider = createCMSProvider(config);

    const entry = await provider.updateEntry(id, body);
    const eventType = body.status === "PUBLISHED" ? "content.published" : "content.updated";
    broadcastSync({ type: eventType, payload: { id: entry.id, timestamp: Date.now() } });
    return NextResponse.json({ data: entry });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update entry" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const config = parseCMSConfig(request.headers);
    const provider = createCMSProvider(config);

    await provider.deleteEntry(id);
    broadcastSync({ type: "content.deleted", payload: { id, timestamp: Date.now() } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete entry" },
      { status: 500 }
    );
  }
}
