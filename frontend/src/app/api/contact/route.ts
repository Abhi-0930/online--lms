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
      "https://online-lms-v11c.onrender.com";

    // Forward to backend contact endpoint
    try {
      const backendRes = await fetch(`${backendUrl}/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, message, phone }),
      });

      if (backendRes.ok) {
        return NextResponse.json({
          success: true,
          message: "Thank you! Your message has been sent to hello@preppath.net.",
        });
      }
    } catch (backendErr) {
      console.warn("Backend forwarding failed, falling back:", backendErr);
    }

    // Direct fallback via Resend API if NEXT_PUBLIC_RESEND_API_KEY or RESEND_API_KEY is available
    const resendApiKey =
      process.env.RESEND_API_KEY || process.env.NEXT_PUBLIC_RESEND_API_KEY;

    if (resendApiKey && !resendApiKey.startsWith("re_123456789")) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "PrepPath <noreply@resend.dev>",
          to: ["hello@preppath.net"],
          reply_to: email,
          subject: `New Contact Inquiry from ${name} - PrepPath`,
          html: `
            <div style="font-family: sans-serif; max-width: 500px; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
              <h2 style="color: #0f172a; margin-top: 0;">New PrepPath Inquiry</h2>
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
              ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ""}
              <p><strong>Message:</strong></p>
              <div style="background: #f8fafc; padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0; white-space: pre-wrap;">${message}</div>
            </div>
          `,
        }),
      });
    }

    return NextResponse.json({
      success: true,
      message: "Thank you! Your message has been received.",
    });
  } catch (error) {
    console.error("Contact submission error:", error);
    return NextResponse.json(
      { error: "Failed to send message. Please email hello@preppath.net directly." },
      { status: 500 }
    );
  }
}
