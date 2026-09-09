import dotenv from 'dotenv';

dotenv.config();

export const env = {
  // Server
  PORT: parseInt(process.env.PORT || '4000', 10),
  HOST: process.env.HOST || '0.0.0.0',
  NODE_ENV: process.env.NODE_ENV || 'development',

  // Database
  DATABASE_URL: process.env.DATABASE_URL || '',
  DIRECT_URL: process.env.DIRECT_URL || '',

  // JWT
  JWT_SECRET: process.env.JWT_SECRET || 'super-secret-jwt-key-replace-in-production',

  // Device Limits
  MAX_CONCURRENT_DEVICES_PER_USER: parseInt(process.env.MAX_CONCURRENT_DEVICES_PER_USER || '2', 10),

  // Email (Resend)
  RESEND_API_KEY: process.env.RESEND_API_KEY || '',
  EMAIL_FROM: process.env.EMAIL_FROM || 'LMS Admin <noreply@yourdomain.com>',

  // BetterStack (Log ingestion)
  BETTERSTACK_INGESTION_KEY: process.env.BETTERSTACK_INGESTION_KEY || '',
  BETTERSTACK_LOGS_URL: process.env.BETTERSTACK_LOGS_URL || 'https://in.logs.betterstack.com',
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
