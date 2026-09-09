import { createApp } from './app';
import { env } from './config/env';
import logger from './utils/logger';

async function start() {
  try {
    const app = await createApp();

    await app.listen({ port: env.PORT, host: env.HOST });

    logger.info(`Server listening on ${env.HOST}:${env.PORT}`);
    logger.info(`API Documentation available at http://${env.HOST}:${env.PORT}/docs`);
  } catch (err) {
    logger.error(err);
    process.exit(1);
  }
}

start();
