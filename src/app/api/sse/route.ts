/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest } from "next/server";

/**
 * SSE endpoint  –  GET /api/sse
 *
 * Clients connect with EventSource("/api/sse").
 * API routes call globalThis.__sseNotify(event, data) to push messages.
 */

type SseWriter = { write: (chunk: string) => void; close: () => void };

// globalThis store for all connected writers
const g = globalThis as unknown as {
  __sseClients?: Set<SseWriter>;
  __sseNotify?: (event: string, data: unknown) => void;
};

if (!g.__sseClients) {
  g.__sseClients = new Set<SseWriter>();
}

// Install the global notify function (idempotent)
g.__sseNotify = (event: string, data: unknown) => {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  g.__sseClients?.forEach((w) => {
    try {
      w.write(payload);
    } catch {
      g.__sseClients?.delete(w);
    }
  });
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const writer: SseWriter = {
        write(chunk: string) {
          controller.enqueue(encoder.encode(chunk));
        },
        close() {
          try { controller.close(); } catch { /* ignore */ }
        },
      };

      g.__sseClients!.add(writer);

      // Send initial keep-alive
      writer.write(": connected\n\n");

      // Keep-alive every 25 seconds to prevent proxy timeouts
      const keepAlive = setInterval(() => {
        try {
          writer.write(": ping\n\n");
        } catch {
          clearInterval(keepAlive);
          g.__sseClients?.delete(writer);
        }
      }, 25_000);

      // Cleanup when client disconnects
      _req.signal.addEventListener("abort", () => {
        clearInterval(keepAlive);
        g.__sseClients?.delete(writer);
        writer.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
