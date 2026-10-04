export const API_BASE_URL = (() => {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
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
    if (!envUrl || envUrl.includes("localhost") || envUrl.includes("127.0.0.1")) {
      return "https://site--preppath-backend--x9gt4y7zlzhr.code.run";
    }
  }
  return (envUrl || "http://localhost:4000").replace(/\/$/, "");
})();

export const WS_BASE_URL = (() => {
  const envWs = process.env.NEXT_PUBLIC_WS_URL;
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
  }
  return (
    envWs ||
    (API_BASE_URL.startsWith("https://")
      ? API_BASE_URL.replace("https://", "wss://")
      : API_BASE_URL.replace("http://", "ws://"))
  ).replace(/\/$/, "");
})();

export function getAuthHeaders(extraHeaders: Record<string, string> = {}): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...extraHeaders,
  };

  if (typeof window !== "undefined") {
    try {
      const accessToken =
        sessionStorage.getItem("lms_access_token") ||
        localStorage.getItem("lms_access_token");
      if (accessToken) {
        headers["Authorization"] = `Bearer ${accessToken}`;
      }

      const sessionToken =
        sessionStorage.getItem("lms_session_token") ||
        localStorage.getItem("lms_active_session_token");
      if (sessionToken) {
        headers["X-Session-Token"] = sessionToken;
      }
    } catch {}
  }

  return headers;
}

