import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const assets = await prisma.mediaAsset.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ data: assets });
}

export async function POST(request: Request) {
  const body = await request.json();
  const asset = await prisma.mediaAsset.create({
    data: {
      filename: body.filename ?? "asset.jpg",
      url: body.url,
      mimeType: body.mimeType ?? "image/jpeg",
      size: body.size ?? 0,
      alt: body.alt,
    },
  });
  return NextResponse.json({ data: asset }, { status: 201 });
}
