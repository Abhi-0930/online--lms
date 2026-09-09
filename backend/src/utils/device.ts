/**
 * Device fingerprinting utilities
 * Generates device identifiers for session tracking
 */

export interface DeviceInfo {
  deviceId: string;
  deviceName: string;
  userAgent: string;
  ipAddress: string;
}

/**
 * Generate a device name from user agent string
 */
export const getDeviceNameFromUserAgent = (userAgent: string): string => {
  const ua = userAgent.toLowerCase();
  
  if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
    if (ua.includes('iphone')) return 'iPhone';
    if (ua.includes('ipad')) return 'iPad';
    if (ua.includes('android')) return 'Android Device';
    return 'Mobile Device';
  }
  
  if (ua.includes('tablet')) return 'Tablet';
  
  if (ua.includes('chrome')) return 'Chrome Browser';
  if (ua.includes('firefox')) return 'Firefox Browser';
  if (ua.includes('safari')) return 'Safari Browser';
  if (ua.includes('edge')) return 'Edge Browser';
  
  return 'Desktop Browser';
};

/**
 * Extract IP address from request (handles proxy headers)
 */
export const getClientIp = (headers: any): string => {
  return (
    headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    headers['x-real-ip'] ||
    headers['cf-connecting-ip'] ||
    '127.0.0.1'
  );
};

/**
 * Generate a simple device fingerprint hash
 * In production, consider using more sophisticated fingerprinting libraries
 */
export const generateDeviceFingerprint = (userAgent: string, ip: string): string => {
  const crypto = require('crypto');
  const data = `${userAgent}-${ip}`;
  return crypto.createHash('sha256').update(data).digest('hex').substring(0, 32);
};
