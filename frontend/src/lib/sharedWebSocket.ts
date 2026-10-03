"use client";

import { WS_BASE_URL } from "@/lib/apiConfig";

type WsListener = (data: any) => void;

class SharedWebSocketManager {
  private socket: WebSocket | null = null;
  private listeners = new Set<WsListener>();
  private reconnectTimer: any = null;
  private pingInterval: any = null;

  public subscribe(listener: WsListener): () => void {
    this.listeners.add(listener);
    this.ensureConnected();

    return () => {
      this.listeners.delete(listener);
      if (this.listeners.size === 0) {
        this.cleanup();
      }
    };
  }

  private ensureConnected() {
    if (typeof window === "undefined") return;
    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      return;
    }

    try {
      const wsUrl = `${WS_BASE_URL}/api/v1/admin/ws`;
      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = () => {
        if (this.pingInterval) clearInterval(this.pingInterval);
        this.pingInterval = setInterval(() => {
          if (this.socket?.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify({ type: "PING" }));
          }
        }, 30000);
      };

      this.socket.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          for (const listener of Array.from(this.listeners)) {
            try {
              listener(payload);
            } catch {}
          }
        } catch {}
      };

      this.socket.onclose = () => {
        this.cleanupSocket();
        if (this.listeners.size > 0 && !this.reconnectTimer) {
          this.reconnectTimer = setTimeout(() => {
            this.reconnectTimer = null;
            this.ensureConnected();
          }, 4000);
        }
      };

      this.socket.onerror = () => {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
          this.socket.close();
        }
      };
    } catch {
      if (this.listeners.size > 0 && !this.reconnectTimer) {
        this.reconnectTimer = setTimeout(() => {
          this.reconnectTimer = null;
          this.ensureConnected();
        }, 5000);
      }
    }
  }

  private cleanupSocket() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
    if (this.socket) {
      this.socket.onopen = null;
      this.socket.onmessage = null;
      this.socket.onclose = null;
      this.socket.onerror = null;
      try {
        this.socket.close();
      } catch {}
      this.socket = null;
    }
  }

  private cleanup() {
    this.cleanupSocket();
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }
}

export const sharedWs = new SharedWebSocketManager();
