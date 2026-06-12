import type { SyncEvent } from "@/modules/cms/types";

type Listener = (event: SyncEvent) => void;

class SyncBus {
  private listeners = new Set<Listener>();

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  emit(event: SyncEvent) {
    this.listeners.forEach((l) => l(event));
  }
}

export const syncBus = new SyncBus();

// SSE clients registry (server-side only)
const sseClients = new Set<ReadableStreamDefaultController<Uint8Array>>();

export function addSSEClient(controller: ReadableStreamDefaultController<Uint8Array>) {
  sseClients.add(controller);
}

export function removeSSEClient(controller: ReadableStreamDefaultController<Uint8Array>) {
  sseClients.delete(controller);
}

export function broadcastSync(event: SyncEvent) {
  syncBus.emit(event);
  const data = `data: ${JSON.stringify(event)}\n\n`;
  const encoded = new TextEncoder().encode(data);
  sseClients.forEach((controller) => {
    try {
      controller.enqueue(encoded);
    } catch {
      sseClients.delete(controller);
    }
  });
}
