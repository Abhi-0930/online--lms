// Centralized API Base URL configuration for local dev and production on Vercel / custom domains
export const API_BASE_URL = (
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE_URL) ||
  (typeof window !== "undefined" &&
  window.location.hostname !== "localhost" &&
  window.location.hostname !== "127.0.0.1"
    ? "https://online-lms-v11c.onrender.com"
    : "http://localhost:4000")
).replace(/\/$/, "");

export const WS_BASE_URL = (
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_WS_URL) ||
  (typeof window !== "undefined" &&
  window.location.hostname !== "localhost" &&
  window.location.hostname !== "127.0.0.1"
    ? "wss://online-lms-v11c.onrender.com"
    : "ws://localhost:4000")
).replace(/\/$/, "");

