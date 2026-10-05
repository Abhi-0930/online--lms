const isStaleOrLocalUrl = (url?: string) =>
  !url ||
  url.includes("localhost") ||
  url.includes("127.0.0.1") ||
  url.includes("code.run") ||
  url.includes("online-lms-v11c");

// Centralized API Base URL configuration for local dev and production on Vercel / custom domains
export const API_BASE_URL = (() => {
  const envUrl = typeof import.meta !== "undefined" ? import.meta.env?.VITE_API_BASE_URL : undefined;
  if (envUrl && !isStaleOrLocalUrl(envUrl)) return envUrl.replace(/\/$/, "");
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    const isLocal =
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname.startsWith("192.168.") ||
      hostname.startsWith("10.") ||
      hostname.startsWith("172.") ||
      hostname.endsWith(".local") ||
      hostname.endsWith(".lan") ||
      /^(?:\d{1,3}\.){3}\d{1,3}$/.test(hostname);
    if (isLocal) {
      return `http://${hostname}:4000`;
    }
    return "https://preppath-e80f.onrender.com";
  }
  return "https://preppath-e80f.onrender.com";
})().replace(/\/$/, "");

export const WS_BASE_URL = (() => {
  const envWs = typeof import.meta !== "undefined" ? import.meta.env?.VITE_WS_URL : undefined;
  if (envWs && !isStaleOrLocalUrl(envWs)) return envWs.replace(/\/$/, "");
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    const isLocal =
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname.startsWith("192.168.") ||
      hostname.startsWith("10.") ||
      hostname.startsWith("172.") ||
      hostname.endsWith(".local") ||
      hostname.endsWith(".lan") ||
      /^(?:\d{1,3}\.){3}\d{1,3}$/.test(hostname);
    if (isLocal) {
      return `ws://${hostname}:4000`;
    }
    return "wss://preppath-e80f.onrender.com";
  }
  return "wss://preppath-e80f.onrender.com";
})().replace(/\/$/, "");

