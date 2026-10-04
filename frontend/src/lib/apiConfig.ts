export const API_BASE_URL = (() => {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    const isLocal = hostname === "localhost" || hostname === "127.0.0.1";
    if (!isLocal) {
      if (!envUrl || envUrl.includes("localhost") || envUrl.includes("127.0.0.1")) {
        return "https://site--preppath-backend--x9gt4y7zlzhr.code.run";
      }
    }
  }
  return (envUrl || "https://site--preppath-backend--x9gt4y7zlzhr.code.run").replace(/\/$/, "");
})();

export const WS_BASE_URL = (
  process.env.NEXT_PUBLIC_WS_URL ||
  (API_BASE_URL.startsWith("https://")
    ? API_BASE_URL.replace("https://", "wss://")
    : API_BASE_URL.replace("http://", "ws://"))
).replace(/\/$/, "");

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

