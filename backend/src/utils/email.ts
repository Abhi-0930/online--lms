import { Resend } from 'resend';
import { env } from '../config/env';
import logger from './logger';

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

function getSenderEmail(): string {
  if (env.EMAIL_FROM && !env.EMAIL_FROM.includes('yourdomain.com')) {
    return env.EMAIL_FROM;
  }
  return 'PrepPath <hello@preppath.net>';
}

export async function sendPasswordResetLinkEmail(params: {
  to: string;
  resetUrl: string;
  name?: string;
  portalType?: 'admin' | 'learner';
}): Promise<boolean> {
  const { to, resetUrl, name, portalType = 'admin' } = params;

  logger.info({ to, resetUrl }, 'Processing password reset link email via Resend');

  if (!resend || !env.RESEND_API_KEY || env.RESEND_API_KEY.startsWith('re_123456789')) {
    logger.warn(
      { to, resetUrl },
      'Resend API key is a placeholder or not provided. Reset Link logged for development testing.'
    );
    return true;
  }

  try {
    const portalName = portalType === 'admin' ? 'PrepPath Admin Portal' : 'PrepPath';
    const { data, error } = await resend.emails.send({
      from: getSenderEmail(),
      to: [to],
      subject: `Reset your password - ${portalName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #0f172a; padding: 28px 12px; margin: 0; }
            .container { max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 20px; padding: 36px; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05); }
            .badge { display: inline-flex; align-items: center; justify-content: center; width: 48px; height: 48px; background: #eaf2fd; border-radius: 14px; margin-bottom: 20px; }
            .title { font-size: 22px; font-weight: 700; color: #0f172a; margin: 0 0 8px 0; }
            .subtitle { font-size: 14px; color: #64748b; line-height: 1.5; margin: 0 0 24px 0; }
            .button { display: inline-block; background-color: #1a73e8; color: #ffffff !important; text-decoration: none; padding: 14px 28px; border-radius: 12px; font-size: 14px; font-weight: 600; text-align: center; margin: 8px 0 24px 0; box-shadow: 0 4px 12px rgba(26,115,232,0.25); }
            .note { font-size: 13px; color: #94a3b8; line-height: 1.5; border-top: 1px solid #f1f5f9; padding-top: 18px; margin-top: 20px; }
            .footer { font-size: 11px; color: #94a3b8; text-align: center; margin-top: 24px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="badge">
              <span style="font-size: 24px;">📖</span>
            </div>
            <div style="font-size: 11px; font-weight: 700; color: #64748b; letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 6px;">
              ${portalName}
            </div>
            <h1 class="title">Password Reset Request</h1>
            <p class="subtitle">
              Hello${name ? ` ${name}` : ''},<br/>
              We received a request to reset your password for your <strong>${portalName}</strong> account. Click the button below to set a new password:
            </p>
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button" target="_blank">Reset Password</a>
            </div>
            <p style="font-size: 13px; color: #64748b; margin-top: 8px;">
              Or copy and paste this link into your browser:<br/>
              <a href="${resetUrl}" style="color: #1a73e8; word-break: break-all; font-size: 12px;">${resetUrl}</a>
            </p>
            <div class="note">
              This password reset link will expire in <strong>15 minutes</strong>.<br/>
              If you didn't request a password reset, you can safely ignore this email — your password will remain unchanged.
            </div>
            <div class="footer">
              © ${new Date().getFullYear()} LearnHub. All rights reserved.
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      logger.error({ error, to }, 'Resend failed to send password reset link email');
      return false;
    }

    logger.info({ id: data?.id, to }, 'Password reset link email sent successfully via Resend');
    return true;
  } catch (err) {
    logger.error({ err, to }, 'Unexpected error sending password reset link with Resend');
    return false;
  }
}

export async function sendPasswordResetOtpEmail(params: {
  to: string;
  code: string;
  name?: string;
}): Promise<boolean> {
  const { to, code, name } = params;

  logger.info({ to, code }, 'Processing password reset OTP email');

  if (!resend || !env.RESEND_API_KEY || env.RESEND_API_KEY.startsWith('re_123456789')) {
    logger.warn(
      { to, code },
      'Resend API key is a placeholder or not provided. OTP logged for development testing.'
    );
    return true;
  }

  try {
    const { data, error } = await resend.emails.send({
      from: getSenderEmail(),
      to: [to],
      subject: 'Your Password Reset Verification Code - PrepPath',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; color: #1e293b; padding: 24px; margin: 0; }
            .container { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 36px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
            .logo { font-size: 20px; font-weight: bold; color: #2563eb; margin-bottom: 24px; }
            .code-box { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; font-size: 32px; font-weight: bold; letter-spacing: 8px; text-align: center; color: #1d4ed8; padding: 18px 0; margin: 24px 0; }
            .footer { font-size: 12px; color: #94a3b8; margin-top: 28px; text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">PrepPath</div>
            <h2 style="margin-top:0;color:#0f172a;">Password Reset Request</h2>
            <p>Hello${name ? ` ${name}` : ''},</p>
            <p>We received a request to reset your PrepPath account password. Use the 6-digit verification code below to proceed:</p>
            <div class="code-box">${code}</div>
            <p style="color:#64748b;font-size:14px;">This code is valid for <strong>10 minutes</strong>. If you did not request a password reset, you can safely ignore this email.</p>
            <div class="footer">
              © ${new Date().getFullYear()} PrepPath Inc. All rights reserved.
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      logger.error({ error, to }, 'Resend failed to send password reset email');
      return false;
    }

    logger.info({ id: data?.id, to }, 'Password reset email sent successfully via Resend');
    return true;
  } catch (err) {
    logger.error({ err, to }, 'Unexpected error sending email with Resend');
    return false;
  }
}

export async function sendWelcomeEmail(params: {
  to: string;
  name: string;
}): Promise<boolean> {
  const { to, name } = params;

  if (!resend || !env.RESEND_API_KEY || env.RESEND_API_KEY.startsWith('re_123456789')) {
    logger.info({ to, name }, 'Welcome email simulated (Resend key is placeholder)');
    return true;
  }

  try {
    const { data, error } = await resend.emails.send({
      from: getSenderEmail(),
      to: [to],
      subject: 'Welcome to PrepPath!',
      html: `
        <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #2563eb;">Welcome to PrepPath, ${name}!</h2>
          <p>Your account is ready. Start exploring courses, curated roadmaps, and hands-on coding practice today.</p>
          <a href="${env.FRONTEND_URL}/dashboard" style="display: inline-block; background: #2563eb; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 16px;">Go to Dashboard</a>
        </div>
      `,
    });

    if (error) {
      logger.error({ error, to }, 'Resend failed to send welcome email');
      return false;
    }

    logger.info({ id: data?.id, to }, 'Welcome email sent successfully via Resend');
    return true;
  } catch (err) {
    logger.error({ err, to }, 'Unexpected error sending welcome email');
    return false;
  }
}

export async function sendContactFormEmail(params: {
  name: string;
  email: string;
  message: string;
  phone?: string;
}): Promise<boolean> {
  const { name, email, message, phone } = params;
  const recipient = env.CONTACT_NOTIFICATION_EMAIL || 'hello@preppath.net';
  logger.info({ name, email, recipient }, `Processing contact form submission email for ${recipient}`);

  if (!resend || !env.RESEND_API_KEY || env.RESEND_API_KEY.startsWith('re_123456789')) {
    logger.info(
      { name, email, message, phone },
      'Contact form submission recorded (Resend API key is placeholder/not configured)'
    );
    return true;
  }

  try {
    const { data, error } = await resend.emails.send({
      from: getSenderEmail(),
      to: [recipient],
      reply_to: email,
      subject: `New Contact Inquiry from ${name} - PrepPath`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #0f172a; padding: 24px; margin: 0; }
            .container { max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 32px; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
            .badge { display: inline-block; background: #f0fdf4; color: #166534; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 6px; letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 12px; }
            .title { font-size: 20px; font-weight: 700; color: #0f172a; margin: 0 0 16px 0; }
            .field { margin-bottom: 14px; }
            .label { font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }
            .value { font-size: 14px; color: #0f172a; margin-top: 4px; font-weight: 500; }
            .message-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px; margin-top: 6px; white-space: pre-wrap; font-size: 14px; line-height: 1.6; color: #334155; }
            .footer { font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 16px; margin-top: 24px; text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="badge">New Website Inquiry</div>
            <h1 class="title">PrepPath Contact Form Submission</h1>
            
            <div class="field">
              <div class="label">Sender Name</div>
              <div class="value">${name}</div>
            </div>

            <div class="field">
              <div class="label">Sender Email</div>
              <div class="value"><a href="mailto:${email}" style="color: #2563eb;">${email}</a></div>
            </div>

            ${phone ? `
            <div class="field">
              <div class="label">Phone Number</div>
              <div class="value"><a href="tel:${phone}" style="color: #2563eb;">${phone}</a></div>
            </div>
            ` : ''}

            <div class="field">
              <div class="label">Message</div>
              <div class="message-box">${message}</div>
            </div>

            <div class="footer">
              This message was submitted via the contact form on <a href="https://preppath.net" style="color: #2563eb;">preppath.net</a>. Click reply to respond directly to ${name}.
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      logger.error({ error }, 'Resend failed to deliver contact form email to hello@preppath.net');
      return false;
    }

    logger.info({ id: data?.id }, 'Contact form email delivered successfully to hello@preppath.net');
    return true;
  } catch (err) {
    logger.error({ err }, 'Error sending contact form email with Resend');
    return false;
  }
}

export async function sendAnnouncementEmail(params: {
  to: string | string[];
  title: string;
  body: string;
  category?: string;
  cohort?: string;
  author?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  meetingLink?: string;
  instructor?: string;
}): Promise<{ sent: number; total: number; success: boolean }> {
  const {
    to,
    title,
    body,
    category = 'General',
    cohort = 'All Cohorts & Learners',
    author = 'Admin Team',
    ctaLabel,
    ctaUrl,
    meetingLink,
    instructor,
  } = params;

  const recipientList = Array.isArray(to) ? to : [to];
  const uniqueRecipients = Array.from(
    new Set(
      recipientList
        .map((e) => (typeof e === 'string' ? e.trim().toLowerCase() : ''))
        .filter((e): e is string => Boolean(e && e.includes('@') && !e.includes('example.com')))
    )
  );

  if (uniqueRecipients.length === 0) {
    logger.warn('sendAnnouncementEmail: No valid recipients found to send announcement email');
    return { sent: 0, total: 0, success: false };
  }

  logger.info(
    { count: uniqueRecipients.length, title, category, cohort },
    'Processing announcement email broadcast via Resend'
  );

  // Convert body text to formatted HTML
  const formattedBody = (body || '')
    .replace(/\r\n/g, '\n')
    .split('\n\n')
    .map((paragraph) => {
      let p = paragraph.trim();
      if (!p) return '';
      // Markdown-like bold: **text**
      p = p.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      // Markdown-like code: `code`
      p = p.replace(
        /`([^`]+)`/g,
        '<code style="background:#f1f5f9;padding:2px 6px;border-radius:4px;font-family:monospace;font-size:13px;color:#0f172a;">$1</code>'
      );
      // Markdown-like links: [text](url)
      p = p.replace(
        /\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g,
        '<a href="$2" style="color:#2563eb;text-decoration:underline;">$1</a>'
      );
      // Bullet list lines: "- item" or "* item"
      if (p.startsWith('- ') || p.startsWith('* ')) {
        const items = p
          .split('\n')
          .map((line) => line.replace(/^[-*]\s*/, '').trim())
          .filter(Boolean)
          .map((item) => `<li style="margin-bottom:6px;">${item}</li>`)
          .join('');
        return `<ul style="margin: 12px 0; padding-left: 20px; color: #334155; font-size: 14px; line-height: 1.6;">${items}</ul>`;
      }
      return `<p style="margin: 0 0 14px 0; color: #334155; font-size: 14px; line-height: 1.6;">${p.replace(/\n/g, '<br/>')}</p>`;
    })
    .filter(Boolean)
    .join('');

  const frontendUrl = env.FRONTEND_URL || 'https://www.preppath.net';
  const targetActionUrl = ctaUrl
    ? (ctaUrl.startsWith('http') ? ctaUrl : `${frontendUrl}${ctaUrl.startsWith('/') ? '' : '/'}${ctaUrl}`)
    : (meetingLink || `${frontendUrl}/announcements`);
  const targetActionLabel = ctaLabel || (meetingLink ? 'Join Live Room' : 'View on PrepPath');

  const categoryColorMap: Record<string, { bg: string; text: string; border: string }> = {
    'Live Session': { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' },
    'Live Class': { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' },
    'Practice & Arena': { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0' },
    'Assignment & Milestone': { bg: '#fffbeb', text: '#b45309', border: '#fde68a' },
    'Contest & Sprint': { bg: '#faf5ff', text: '#7e22ce', border: '#e9d5ff' },
    'Platform Notice': { bg: '#eef2ff', text: '#4338ca', border: '#c7d2fe' },
    'Career & Placement': { bg: '#ecfeff', text: '#0e7490', border: '#a5f3fc' },
  };

  const badgeStyle = categoryColorMap[category] || { bg: '#f1f5f9', text: '#475569', border: '#e2e8f0' };

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #0f172a; margin: 0; padding: 24px 12px; }
        .container { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 20px; padding: 32px; border: 1px solid #e2e8f0; box-shadow: 0 10px 30px -5px rgba(0,0,0,0.05); }
        .badges { margin-bottom: 16px; }
        .badge { display: inline-block; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 8px; text-transform: uppercase; letter-spacing: 0.05em; margin-right: 6px; }
        .title { font-size: 22px; font-weight: 800; color: #0f172a; line-height: 1.35; margin: 0 0 16px 0; }
        .author-info { font-size: 12px; color: #64748b; margin-bottom: 20px; }
        .content-box { background: #fafbfc; border: 1px solid #edf2f7; border-radius: 14px; padding: 20px; margin-bottom: 24px; }
        .btn { display: inline-block; background: #2563eb; color: #ffffff !important; font-size: 14px; font-weight: 700; text-decoration: none; padding: 12px 28px; border-radius: 12px; text-align: center; box-shadow: 0 4px 14px rgba(37,99,235,0.25); }
        .footer { font-size: 12px; color: #94a3b8; text-align: center; margin-top: 28px; line-height: 1.5; border-top: 1px solid #f1f5f9; padding-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div style="font-size: 11px; font-weight: 800; color: #2563eb; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 12px;">
          PREPPATH ANNOUNCEMENT
        </div>
        
        <div class="badges">
          <span class="badge" style="background: ${badgeStyle.bg}; color: ${badgeStyle.text}; border: 1px solid ${badgeStyle.border};">
            ${category}
          </span>
          ${
            cohort && cohort !== 'All Cohorts & Learners'
              ? `
          <span class="badge" style="background: #fdf4ff; color: #9333ea; border: 1px solid #f0abfc;">
            ${cohort}
          </span>
          `
              : `
          <span class="badge" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1;">
            All Learners
          </span>
          `
          }
        </div>

        <h1 class="title">${title}</h1>

        <div class="author-info">
          <span>Posted by <strong>${instructor || author}</strong></span>
          <span> • </span>
          <span>${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
        </div>

        <div class="content-box">
          ${formattedBody}
        </div>

        ${
          targetActionUrl
            ? `
        <div style="text-align: center; margin: 28px 0 12px 0;">
          <a href="${targetActionUrl}" class="btn" target="_blank">
            ${targetActionLabel} &rarr;
          </a>
        </div>
        `
            : ''
        }

        <div class="footer">
          You received this email because you are enrolled on <strong>PrepPath</strong>.<br/>
          To view all updates and live classrooms, visit <a href="${frontendUrl}/announcements" style="color: #2563eb;">PrepPath Announcements</a>.<br/>
          &copy; ${new Date().getFullYear()} PrepPath Inc. All rights reserved.
        </div>
      </div>
    </body>
    </html>
  `;

  if (!resend || !env.RESEND_API_KEY || env.RESEND_API_KEY.startsWith('re_123456789')) {
    logger.info(
      { recipients: uniqueRecipients.length, title },
      'Announcement email broadcast simulated (Resend API key is placeholder)'
    );
    return { sent: uniqueRecipients.length, total: uniqueRecipients.length, success: true };
  }

  // Send to recipients in parallel batches of 10
  let sentCount = 0;
  const batchSize = 10;
  for (let i = 0; i < uniqueRecipients.length; i += batchSize) {
    const chunk = uniqueRecipients.slice(i, i + batchSize);
    await Promise.all(
      chunk.map(async (recipientEmail) => {
        try {
          const { error } = await resend.emails.send({
            from: getSenderEmail(),
            to: [recipientEmail],
            subject: `📢 ${title} - PrepPath`,
            html: htmlContent,
          });
          if (error) {
            logger.error({ error, recipientEmail }, 'Failed to send announcement email to recipient');
          } else {
            sentCount++;
          }
        } catch (sendErr) {
          logger.error({ sendErr, recipientEmail }, 'Error sending announcement email');
        }
      })
    );
  }

  logger.info({ sentCount, total: uniqueRecipients.length, title }, 'Announcement email broadcast complete');
  return { sent: sentCount, total: uniqueRecipients.length, success: sentCount > 0 };
}


