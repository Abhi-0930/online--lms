import { Resend } from 'resend';
import { env } from '../config/env';
import logger from './logger';

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

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
    const portalName = portalType === 'admin' ? 'LearnHub Admin Portal' : 'LearnHub';
    const { data, error } = await resend.emails.send({
      from: env.EMAIL_FROM || 'LearnHub <onboarding@resend.dev>',
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
      from: env.EMAIL_FROM || 'PrepPath <noreply@resend.dev>',
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
      from: env.EMAIL_FROM || 'PrepPath <noreply@resend.dev>',
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
