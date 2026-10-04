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

    const backendUrl =
      process.env.NEXT_PUBLIC_API_URL ||
      process.env.API_URL ||
      "https://site--preppath-backend--x9gt4y7zlzhr.code.run";

    // Forward securely to backend contact endpoint (backend holds all private email credentials)
    const backendRes = await fetch(`${backendUrl}/contact`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, message, phone }),
    });

    if (backendRes.ok) {
      const data = await backendRes.json();
      return NextResponse.json(data);
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
