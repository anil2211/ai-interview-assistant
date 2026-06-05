import http from 'http';
import { config } from './config/env';
import app from './app';
import database from './config/database';
import { initializeWebSocket } from './websocket/index';
import { logger } from './middleware/logger';

const server = http.createServer(app);

const io = initializeWebSocket(server);

async function startServer(): Promise<void> {
  try {
    await database.connect();

    server.listen(config.port, () => {
      logger.info(`Server started successfully`);
      logger.info(`HTTP Server: http://localhost:${config.port}`);
      logger.info(`WebSocket Server: ws://localhost:${config.port}`);
      logger.info(`Environment: ${config.nodeEnv}`);
      logger.info(`Health Check: http://localhost:${config.port}/api/v1/health`);

      if (config.prometheusEnabled) {
        logger.info(`Metrics: http://localhost:${config.port}/metrics`);
      }
    });

    server.on('error', (error: NodeJS.ErrnoException) => {
      if (error.code === 'EADDRINUSE') {
        logger.error(`Port ${config.port} is already in use`);
        process.exit(1);
      } else {
        logger.error('Server error:', error);
        process.exit(1);
      }
    });

    server.on('close', () => {
      logger.info('Server closed');
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

function gracefulShutdown(signal: string): void {
  logger.info(`${signal} received. Starting graceful shutdown...`);

  const shutdownTimeout = setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 30000);

  server.close(async () => {
    try {
      io.close();
      logger.info('WebSocket server closed');

      await database.disconnect();
      logger.info('Database connection closed');

      clearTimeout(shutdownTimeout);
      logger.info('Graceful shutdown completed');
      process.exit(0);
    } catch (error) {
      logger.error('Error during shutdown:', error);
      clearTimeout(shutdownTimeout);
      process.exit(1);
    }
  });

  server.unref();
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason: any) => {
  logger.error('Unhandled Rejection:', reason);
});

startServer();

export { app, server, io };
