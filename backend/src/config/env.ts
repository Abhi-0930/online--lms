import dotenv from 'dotenv';

dotenv.config();

export const env = {
  // Server
  PORT: parseInt(process.env.PORT || (process.env.NODE_ENV === 'production' ? '7860' : '4000'), 10),
  HOST: process.env.HOST || '0.0.0.0',
  NODE_ENV: process.env.NODE_ENV || 'development',

  // Database
  DATABASE_URL: process.env.DATABASE_URL || '',
  DIRECT_URL: process.env.DIRECT_URL || '',

  // JWT
  JWT_SECRET: process.env.JWT_SECRET || 'super-secret-jwt-key-replace-in-production',

  // Device Limits
  MAX_CONCURRENT_DEVICES_PER_USER: parseInt(process.env.MAX_CONCURRENT_DEVICES_PER_USER || '1', 10),

  // Email (Resend)
  RESEND_API_KEY: process.env.RESEND_API_KEY || '',
  EMAIL_FROM: process.env.EMAIL_FROM || 'PrepPath <hello@preppath.net>',
  CONTACT_NOTIFICATION_EMAIL: process.env.CONTACT_NOTIFICATION_EMAIL || 'hello@preppath.net',

  // BetterStack (Log ingestion)
  BETTERSTACK_INGESTION_KEY: process.env.BETTERSTACK_INGESTION_KEY || '',
  BETTERSTACK_LOGS_URL: process.env.BETTERSTACK_LOGS_URL || 'https://in.logs.betterstack.com',

  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',
  GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL || (process.env.NODE_ENV === 'production' || process.env.RENDER === 'true' ? 'https://preppath-e80f.onrender.com/api/v1/auth/google/callback' : 'http://localhost:4000/api/v1/auth/google/callback'),
  FRONTEND_URL: process.env.FRONTEND_URL || (process.env.NODE_ENV === 'production' || process.env.RENDER === 'true' ? 'https://www.preppath.net' : 'http://localhost:3000'),

  // Razorpay
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || 'rzp_test_TjTmBMa68YS2ki',
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || 'UH123kXTQC7cq5kraIO8zCYm',
};

// Validate required environment variables
const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET'];

if (env.NODE_ENV === 'production') {
  requiredEnvVars.forEach((varName) => {
    if (!process.env[varName]) {
      throw new Error(`Missing required environment variable: ${varName}`);
    }
  });
}
