import pino from 'pino';
import { env } from '../config/env';

// BetterStack Log Shipper Configuration
const transport = env.BETTERSTACK_INGESTION_KEY
  ? pino.transport({
      target: 'pino/file',
      options: {
        destination: env.BETTERSTACK_LOGS_URL,
        headers: {
          'Authorization': `Bearer ${env.BETTERSTACK_INGESTION_KEY}`,
          'Content-Type': 'application/json',
        },
      },
    })
  : pino.transport({
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      },
    });

export const logger = pino(
  {
    level: env.NODE_ENV === 'production' ? 'info' : 'debug',
    base: {
      pid: process.pid,
      hostname: require('os').hostname(),
    },
    serializers: {
      req: pino.stdSerializers.req,
      res: pino.stdSerializers.res,
      err: pino.stdSerializers.err,
    },
    timestamp: pino.stdTimeFunctions.isoTime,
  },
  transport
);

export default logger;
