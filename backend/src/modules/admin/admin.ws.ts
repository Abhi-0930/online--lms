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

  private static async sendSnapshot(socket: WebSocket, prisma: PrismaClient, type: string) {
    try {
      const adminService = new AdminService(prisma);
      const [stats, students, courses, assignments, submissions, content, practiceProblems, liveSessions] = await Promise.all([
        adminService.getDashboardStats(),
        adminService.getAllStudents(),
        adminService.getAllCourses(),
        adminService.getAllAssignments(),
        adminService.getAllSubmissions(),
        adminService.getAllContent(),
        adminService.getAllPracticeProblems(),
        adminService.getAllLiveSessions(),
      ]);

      if (socket.readyState === WebSocket.OPEN) {
        socket.send(
          JSON.stringify({
            type,
            data: { stats, students, courses, assignments, submissions, content, practiceProblems, liveSessions },
            timestamp: new Date().toISOString(),
          })
        );
      }
    } catch (err: any) {
      logger.error({ err: err.message }, 'Failed to send admin snapshot via WebSocket');
    }
  }

  public static async broadcastUpdate(prisma: PrismaClient) {
    if (this.clients.size === 0) return;

    try {
      const adminService = new AdminService(prisma);
      const [stats, students, courses, assignments, submissions, content, practiceProblems, liveSessions] = await Promise.all([
        adminService.getDashboardStats(),
        adminService.getAllStudents(),
        adminService.getAllCourses(),
        adminService.getAllAssignments(),
        adminService.getAllSubmissions(),
        adminService.getAllContent(),
        adminService.getAllPracticeProblems(),
        adminService.getAllLiveSessions(),
      ]);

      const payload = JSON.stringify({
        type: 'DATA_UPDATE',
        data: { stats, students, courses, assignments, submissions, content, practiceProblems, liveSessions },
        timestamp: new Date().toISOString(),
      });

      for (const client of this.clients) {
        if (client.readyState === WebSocket.OPEN) {
          client.send(payload);
        } else {
          this.clients.delete(client);
        }
      }

      logger.info({ clientCount: this.clients.size }, 'Broadcasted real-time WebSocket update to admins');
    } catch (err: any) {
      logger.error({ err: err.message }, 'Failed to broadcast admin WebSocket update');
    }
  }

  public static getConnectedCount(): number {
    return this.clients.size;
  }
}
