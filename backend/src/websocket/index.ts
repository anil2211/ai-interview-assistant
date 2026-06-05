import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { IJwtPayload } from '../types';
import { logger } from '../middleware/logger';
import { registerHandlers } from './handlers';

let io: Server;

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
}

export function initializeWebSocket(httpServer: HttpServer): Server {
  io = new Server(httpServer, {
    cors: {
      origin: config.corsOrigins,
      credentials: true,
      methods: ['GET', 'POST'],
    },
    pingInterval: 10000,
    pingTimeout: 5000,
    transports: ['websocket', 'polling'],
    maxHttpBufferSize: 1e7,
    allowEIO3: true,
  });

  io.use((socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.query.token;

      if (!token) {
        socket.userId = undefined;
        socket.userRole = 'guest';
        return next();
      }

      const tokenStr = Array.isArray(token) ? token[0] : token;
      const decoded = jwt.verify(tokenStr, config.jwtSecret) as IJwtPayload;

      socket.userId = decoded.userId;
      socket.userRole = decoded.role;
      next();
    } catch (error) {
      socket.userId = undefined;
      socket.userRole = 'guest';
      next();
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    const userId = socket.userId || 'guest';
    logger.info(`WebSocket client connected: ${socket.id} (user: ${userId})`);

    socket.emit('connected', {
      socketId: socket.id,
      userId,
      message: 'Connected to AI Interview Assistant',
    });

    registerHandlers(io, socket);

    socket.on('disconnect', (reason: string) => {
      logger.info(`WebSocket client disconnected: ${socket.id} (reason: ${reason})`);

      const rooms = Array.from(socket.rooms).filter(r => r !== socket.id);
      rooms.forEach(room => {
        io.to(room).emit('user-disconnected', {
          userId,
          socketId: socket.id,
        });
      });
    });

    socket.on('error', (error: Error) => {
      logger.error(`WebSocket error for ${socket.id}:`, error);
      socket.emit('error', {
        message: 'An internal error occurred',
        code: 'WS_ERROR',
      });
    });
  });

  logger.info('WebSocket server initialized');
  return io;
}

export function getIO(): Server {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
}

export default { initializeWebSocket, getIO };
