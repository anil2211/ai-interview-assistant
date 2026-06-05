import { Server, Socket } from 'socket.io';
import { logger } from '../middleware/logger';
import speechService from '../services/SpeechService';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
}

export function registerHandlers(_io: Server, socket: AuthenticatedSocket): void {
  socket.on('join-interview', async (data: { interviewId: string }, callback?: Function) => {
    try {
      const { interviewId } = data;

      if (!interviewId) {
        socket.emit('error', { message: 'Interview ID is required', code: 'VALIDATION_ERROR' });
        if (callback) callback({ error: 'Interview ID is required' });
        return;
      }

      socket.join(`interview:${interviewId}`);
      socket.data.interviewId = interviewId;

      socket.to(`interview:${interviewId}`).emit('user-joined', {
        userId: socket.userId,
        socketId: socket.id,
      });

      logger.info(`User ${socket.userId} joined interview room: ${interviewId}`);

      if (callback) callback({ success: true });
    } catch (error) {
      logger.error('Error joining interview:', error);
      socket.emit('error', { message: 'Failed to join interview', code: 'JOIN_ERROR' });
      if (callback) callback({ error: 'Failed to join interview' });
    }
  });

  socket.on('leave-interview', (data: { interviewId: string }, callback?: Function) => {
    try {
      const { interviewId } = data;

      if (interviewId) {
        socket.leave(`interview:${interviewId}`);
        socket.to(`interview:${interviewId}`).emit('user-left', {
          userId: socket.userId,
          socketId: socket.id,
        });
        logger.info(`User ${socket.userId} left interview room: ${interviewId}`);
      }

      delete socket.data.interviewId;
      if (callback) callback({ success: true });
    } catch (error) {
      logger.error('Error leaving interview:', error);
      if (callback) callback({ error: 'Failed to leave interview' });
    }
  });

  socket.on('transcribe-audio', async (data: { audio: string; interviewId: string; language?: string }) => {
    try {
      const { audio, language } = data;

      if (!audio) {
        socket.emit('error', { message: 'Audio data is required', code: 'VALIDATION_ERROR' });
        return;
      }

      const audioBuffer = Buffer.from(audio, 'base64');
      const result = await speechService.transcribeAudio(audioBuffer, language || 'en');

      socket.emit('transcription-result', {
        text: result.text,
        isFinal: result.isFinal,
        interviewId: data.interviewId,
      });

      if (result.isFinal && data.interviewId) {
        socket.to(`interview:${data.interviewId}`).emit('transcription-result', {
          text: result.text,
          isFinal: true,
          userId: socket.userId,
          interviewId: data.interviewId,
        });
      }
    } catch (error) {
      logger.error('Transcription error:', error);
      socket.emit('error', {
        message: 'Failed to transcribe audio',
        code: 'TRANSCRIPTION_ERROR',
      });
    }
  });

  socket.on('answer-submitted', (data: { interviewId: string; questionId: string }) => {
    const { interviewId, questionId } = data;

    socket.to(`interview:${interviewId}`).emit('answer-submitted', {
      interviewId,
      questionId,
      userId: socket.userId,
    });

    logger.info(`Answer submitted event for interview ${interviewId}, question ${questionId}`);
  });

  socket.on('feedback-received', (data: { interviewId: string; questionId: string; score: number }) => {
    const { interviewId, questionId, score } = data;

    socket.emit('feedback-received', {
      interviewId,
      questionId,
      score,
      userId: socket.userId,
    });

    socket.to(`interview:${interviewId}`).emit('feedback-received', {
      interviewId,
      questionId,
      score,
      userId: socket.userId,
    });
  });

  socket.on('typing-indicator', (data: { interviewId: string; isTyping: boolean }) => {
    const { interviewId, isTyping } = data;

    socket.to(`interview:${interviewId}`).emit('typing-indicator', {
      userId: socket.userId,
      isTyping,
      interviewId,
    });
  });

  socket.on('ping-server', (callback?: Function) => {
    if (callback) {
      callback({
        timestamp: new Date().toISOString(),
        userId: socket.userId,
        socketId: socket.id,
      });
    }
  });
}
