import { addSSEClient, removeSSEClient } from "@/lib/sync-bus";

export const dynamic = "force-dynamic";

export async function GET() {
  const encoder = new TextEncoder();
  let heartbeat: ReturnType<typeof setInterval> | null = null;

  const stream = new ReadableStream({
    start(controller) {
      addSSEClient(controller);
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "connected" })}\n\n`));

      heartbeat = setInterval(() => {
        try {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: "heartbeat", timestamp: Date.now() })}\n\n`)
          );
        } catch {
          if (heartbeat) clearInterval(heartbeat);
        }
      }, 15000);
    },
    cancel(controller) {
      if (heartbeat) clearInterval(heartbeat);
      removeSSEClient(controller as ReadableStreamDefaultController<Uint8Array>);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
