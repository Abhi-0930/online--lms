import { WebSocket } from 'ws';
import { PrismaClient } from '@prisma/client';
import { AdminService } from './admin.service';
import logger from '../../utils/logger';

export class AdminWsBroadcaster {
  private static clients = new Set<WebSocket>();

  public static addClient(socket: WebSocket, prisma: PrismaClient) {
    this.clients.add(socket);
    logger.info({ totalConnected: this.clients.size }, 'Admin WebSocket client connected');

    // Send initial snapshot immediately on connection
    this.sendSnapshot(socket, prisma, 'INITIAL_DATA');

    socket.on('message', async (raw) => {
      try {
        const msg = JSON.parse(raw.toString());
        if (msg.type === 'PING') {
          if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ type: 'PONG', timestamp: Date.now() }));
          }
        } else if (msg.type === 'REFRESH') {
          await this.sendSnapshot(socket, prisma, 'DATA_UPDATE');
        }
      } catch {
        // ignore malformed client packets
      }
    });

    socket.on('close', () => {
      this.clients.delete(socket);
      logger.info({ totalConnected: this.clients.size }, 'Admin WebSocket client disconnected');
    });

    socket.on('error', (err) => {
      logger.warn({ err: err.message }, 'Admin WebSocket error');
      this.clients.delete(socket);
    });
  }

  private static cachedPayload: string | null = null;
  private static cachedTimestamp = 0;
  private static inflightPromise: Promise<string> | null = null;
  private static broadcastDebounceTimer: any = null;

  private static async getOrBuildPayload(prisma: PrismaClient): Promise<string> {
    const now = Date.now();
    // Use cached payload if built within the last 2.5 seconds
    if (this.cachedPayload && now - this.cachedTimestamp < 2500) {
      return this.cachedPayload;
    }

    if (this.inflightPromise) {
      return this.inflightPromise;
    }

    this.inflightPromise = (async () => {
      try {
        const adminService = new AdminService(prisma);
        const [stats, students, courses, assignments, submissions, content, practiceProblems, liveSessions, announcements, instructors, recordings, payments, auditLogs] = await Promise.all([
          adminService.getDashboardStats(),
          adminService.getAllStudents(),
          adminService.getAllCourses(),
          adminService.getAllAssignments(),
          adminService.getAllSubmissions(),
          adminService.getAllContent(),
          adminService.getAllPracticeProblems(),
          adminService.getAllLiveSessions(),
          adminService.getAllAnnouncements(),
          adminService.getInstructors(),
          adminService.getAllRecordings(),
          adminService.getAllPayments(),
          adminService.getAuditLogs(),
        ]);

        const payload = JSON.stringify({
          type: 'DATA_UPDATE',
          data: { stats, students, courses, assignments, submissions, content, practiceProblems, liveSessions, announcements, instructors, recordings, payments, auditLogs },
          timestamp: new Date().toISOString(),
        });

        this.cachedPayload = payload;
        this.cachedTimestamp = Date.now();
        return payload;
      } finally {
        this.inflightPromise = null;
      }
    })();

    return this.inflightPromise;
  }

  private static async sendSnapshot(socket: WebSocket, prisma: PrismaClient, type: string) {
    try {
      const payloadString = await this.getOrBuildPayload(prisma);
      if (socket.readyState === WebSocket.OPEN) {
        if (type === 'INITIAL_DATA') {
          // Replace message type cleanly without full re-serialization
          const initPayload = payloadString.replace('"type":"DATA_UPDATE"', '"type":"INITIAL_DATA"');
          socket.send(initPayload);
        } else {
          socket.send(payloadString);
        }
      }
    } catch (err: any) {
      logger.error({ err: err.message }, 'Failed to send admin snapshot via WebSocket');
    }
  }

  public static async broadcastUpdate(prisma: PrismaClient) {
    if (this.clients.size === 0) return;

    // Invalidate cache immediately on data change
    this.cachedPayload = null;
    this.cachedTimestamp = 0;

    // Debounce rapid successive broadcasts within 200ms
    if (this.broadcastDebounceTimer) {
      clearTimeout(this.broadcastDebounceTimer);
    }

    this.broadcastDebounceTimer = setTimeout(async () => {
      try {
        const payload = await this.getOrBuildPayload(prisma);

        for (const client of this.clients) {
          if (client.readyState === WebSocket.OPEN) {
            client.send(payload);
          } else {
            this.clients.delete(client);
          }
        }

        logger.info({ clientCount: this.clients.size }, 'Broadcasted real-time WebSocket update to clients');
      } catch (err: any) {
        logger.error({ err: err.message }, 'Failed to broadcast admin WebSocket update');
      }
    }, 150);
  }

  public static getConnectedCount(): number {
    return this.clients.size;
  }
}

