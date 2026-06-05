import type { Feedback, Question, QuestionFeedback, TranscriptionData } from '@/types';
import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:3000';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    const token = localStorage.getItem('accessToken');
    socket = io(WS_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      autoConnect: false,
    });

    socket.on('connect', () => {
      console.log('[WS] Connected:', socket?.id);
    });

    socket.on('disconnect', (reason) => {
      console.log('[WS] Disconnected:', reason);
    });

    socket.on('connect_error', (error) => {
      console.error('[WS] Connection error:', error.message);
    });

    socket.on('reconnect', (attemptNumber) => {
      console.log('[WS] Reconnected after', attemptNumber, 'attempts');
    });

    socket.on('reconnect_error', (error) => {
      console.error('[WS] Reconnect error:', error.message);
    });
  }

  return socket;
}

export function connectSocket(): void {
  const s = getSocket();
  if (!s.connected) {
    s.auth = { token: localStorage.getItem('accessToken') };
    s.connect();
  }
}

export function disconnectSocket(): void {
  if (socket?.connected) {
    socket.disconnect();
  }
}

export function joinInterview(interviewId: string): void {
  getSocket().emit('join-interview', { interviewId });
}

export function leaveInterview(interviewId: string): void {
  getSocket().emit('leave-interview', { interviewId });
}

export function sendAudioData(audioBlob: Blob): void {
  const reader = new FileReader();
  reader.onload = () => {
    if (reader.result && typeof reader.result === 'string') {
      getSocket().emit('audio-data', {
        audio: reader.result,
        timestamp: Date.now(),
      });
    }
  };
  reader.readAsDataURL(audioBlob);
}

export interface WebSocketHandlers {
  onTranscription?: (data: TranscriptionData) => void;
  onFeedback?: (data: QuestionFeedback) => void;
  onInterviewComplete?: (data: Feedback) => void;
  onError?: (error: string) => void;
  onQuestionChanged?: (question: Question) => void;
  onTimeWarning?: (seconds: number) => void;
}

export function useWebSocket(handlers: WebSocketHandlers) {
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    const s = getSocket();

    const handleTranscription = (data: TranscriptionData) => {
      handlersRef.current.onTranscription?.(data);
    };

    const handleFeedback = (data: QuestionFeedback) => {
      handlersRef.current.onFeedback?.(data);
    };

    const handleInterviewComplete = (data: Feedback) => {
      handlersRef.current.onInterviewComplete?.(data);
    };

    const handleError = (error: string) => {
      handlersRef.current.onError?.(error);
    };

    const handleQuestionChanged = (question: Question) => {
      handlersRef.current.onQuestionChanged?.(question);
    };

    const handleTimeWarning = (seconds: number) => {
      handlersRef.current.onTimeWarning?.(seconds);
    };

    s.on('transcription', handleTranscription);
    s.on('feedback', handleFeedback);
    s.on('interview-complete', handleInterviewComplete);
    s.on('error', handleError);
    s.on('question-changed', handleQuestionChanged);
    s.on('time-warning', handleTimeWarning);

    return () => {
      s.off('transcription', handleTranscription);
      s.off('feedback', handleFeedback);
      s.off('interview-complete', handleInterviewComplete);
      s.off('error', handleError);
      s.off('question-changed', handleQuestionChanged);
      s.off('time-warning', handleTimeWarning);
    };
  }, []);
}

export default useWebSocket;
