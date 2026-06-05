import winston from 'winston';
import morgan from 'morgan';
import { Request, Response } from 'express';
import { config, isDevelopment, isProduction, isTest } from '../config/env';

const loggerTransports: winston.transport[] = [
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.printf(({ timestamp, level, message, ...meta }) => {
        const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
        return `${timestamp} [${level}]: ${message}${metaStr}`;
      })
    ),
  }),
];

if (!isTest) {
  loggerTransports.push(
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880,
      maxFiles: 5,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880,
      maxFiles: 5,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
    })
  );

  try {
    const FluentLogger = require('fluent-logger').support.winstonTransport();
    const fluentTransport = new FluentLogger('ai-interview-assistant', {
      host: config.fluentHost,
      port: config.fluentPort,
      timeout: 3.0,
      requireAckResponse: true,
    });
    loggerTransports.push(fluentTransport);
  } catch {
    // Fluent logger not available
  }
}

export const logger = winston.createLogger({
  level: config.logLevel,
  format: winston.format.json(),
  transports: loggerTransports,
  exitOnError: false,
});

export const requestLogger = morgan(
  (tokens: any, req: Request, res: Response) => {
    const logData = {
      method: tokens.method(req, res),
      url: tokens.url(req, res),
      status: tokens.status(req, res),
      contentLength: tokens.res(req, res, 'content-length'),
      responseTime: `${tokens['response-time'](req, res)}ms`,
      userAgent: req.headers['user-agent'],
      ip: req.ip,
    };

    const message = `${logData.method} ${logData.url} ${logData.status} ${logData.responseTime}`;

    if (isProduction) {
      logger.info(message, logData);
    } else {
      logger.debug(message, logData);
    }

    return message;
  },
  {
    skip: (_req: Request) => {
      if (isDevelopment) return false;
      const skipPaths = ['/health', '/metrics'];
      return skipPaths.includes(_req.path);
    },
  }
);

export class LoggerStream {
  write(message: string): void {
    logger.info(message.trim());
  }
}

export default logger;
