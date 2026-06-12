import { NextResponse } from "next/server";

export async function GET() {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const send = (data: unknown) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      send({ type: "connected", timestamp: Date.now() });

      const interval = setInterval(() => {
        send({
          type: "heartbeat",
          timestamp: Date.now(),
          activeConnections: 1,
        });
      }, 15000);

      // Keep reference for potential cleanup
      void interval;
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  return NextResponse.json({
    type: "content-update",
    payload: body,
    timestamp: Date.now(),
  });
}
