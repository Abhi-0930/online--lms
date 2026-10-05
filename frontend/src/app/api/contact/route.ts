import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, message, phone } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are required." },
        { status: 400 }
      );
    }

    const candidateUrls = [
      process.env.INTERNAL_API_URL,
      process.env.API_URL,
      process.env.NEXT_PUBLIC_API_URL,
      "http://localhost:4000",
      "http://127.0.0.1:4000",
      "https://online-lms-v11c.onrender.com",
      "https://site--preppath-backend--x9gt4y7zlzhr.code.run",
    ].filter(Boolean) as string[];

    let lastError: any = null;
    let backendRes: Response | null = null;

    for (const baseUrl of candidateUrls) {
      const cleanBase = baseUrl.replace(/\/api\/v1\/?$/, "").replace(/\/+$/, "");
      const targetEndpoints = [`${cleanBase}/contact`, `${cleanBase}/api/v1/contact`];

      for (const endpoint of targetEndpoints) {
        try {
          const res = await fetch(endpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ name, email, message, phone }),
            signal: AbortSignal.timeout(6000),
          });

          if (res.ok) {
            const data = await res.json();
            return NextResponse.json(data);
          } else if (res.status !== 404 && res.status !== 502) {
            backendRes = res;
          }
        } catch (err) {
          lastError = err;
        }
      }
    }

    const errorData = await backendRes.json().catch(() => ({}));
    return NextResponse.json(
      { error: errorData.message || "Failed to deliver message. Please email hello@preppath.net directly." },
      { status: backendRes.status || 500 }
    );
  } catch (error) {
    console.error("Contact forwarding error:", error);
    return NextResponse.json(
      { error: "Failed to send message. Please email hello@preppath.net directly." },
      { status: 500 }
    );
  }
}
