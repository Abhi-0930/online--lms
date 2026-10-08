import { WebSocket } from 'ws';
import { PrismaClient } from '@prisma/client';
import logger from '../../utils/logger';

export class AdminWsBroadcaster {
  private static clients = new Set<WebSocket>();
  private static broadcastDebounceTimer: any = null;
  private static cacheInvalidators = new Set<() => void>();

  public static onBroadcast(invalidator: () => void) {
    this.cacheInvalidators.add(invalidator);
  }

  public static addClient(socket: WebSocket, _prisma: PrismaClient) {
    this.clients.add(socket);
    logger.info({ totalConnected: this.clients.size }, 'WebSocket client connected');

    // Send instant lightweight connection confirmation (0 bytes overhead)
    if (socket.readyState === WebSocket.OPEN) {
      try {
        socket.send(JSON.stringify({ type: 'CONNECTED', timestamp: new Date().toISOString() }));
      } catch {}
    }

    socket.on('message', (raw) => {
      try {
        const msg = JSON.parse(raw.toString());
        if (msg.type === 'PING') {
          if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ type: 'PONG', timestamp: Date.now() }));
          }
        } else if (msg.type === 'REFRESH') {
          if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ type: 'DATA_UPDATE', timestamp: new Date().toISOString() }));
          }
        }
      } catch {
        // ignore malformed client packets
      }
    });

    socket.on('close', () => {
      this.clients.delete(socket);
      logger.info({ totalConnected: this.clients.size }, 'WebSocket client disconnected');
    });

    socket.on('error', (err) => {
      logger.warn({ err: err.message }, 'WebSocket client error');
      this.clients.delete(socket);
    });
  }

  public static async broadcastUpdate(_prisma?: PrismaClient): Promise<void> {
    this.cacheInvalidators.forEach((fn) => {
      try { fn(); } catch {}
    });

    if (this.clients.size === 0) return;

    // Debounce rapid successive broadcasts within 150ms
    if (this.broadcastDebounceTimer) {
      clearTimeout(this.broadcastDebounceTimer);
    }

    this.broadcastDebounceTimer = setTimeout(() => {
      const payload = JSON.stringify({
        type: 'DATA_UPDATE',
        timestamp: new Date().toISOString(),
      });

      for (const client of Array.from(this.clients)) {
        try {
          if (client.readyState === WebSocket.OPEN) {
            client.send(payload);
          } else {
            this.clients.delete(client);
          }
        } catch {
          this.clients.delete(client);
        }
      }

      logger.info({ clientCount: this.clients.size }, 'Broadcasted lightweight real-time event to clients');
    }, 150);
  }

  public static getConnectedCount(): number {
    return this.clients.size;
  }
}
