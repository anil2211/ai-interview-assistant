import { create } from 'zustand';
import type { Interview, Question, Answer, QuestionFeedback } from '@/types';

interface InterviewState {
  currentInterview: Interview | null;
  currentQuestion: Question | null;
  questions: Question[];
  answers: Answer[];
  transcription: string;
  interimTranscription: string;
  isRecording: boolean;
  recordingDuration: number;
  isProcessing: boolean;
  error: string | null;

  setCurrentInterview: (interview: Interview | null) => void;
  setCurrentQuestion: (question: Question | null) => void;
  setQuestions: (questions: Question[]) => void;
  addAnswer: (answer: Answer) => void;
  setTranscription: (text: string) => void;
  setInterimTranscription: (text: string) => void;
  setIsRecording: (isRecording: boolean) => void;
  setRecordingDuration: (duration: number) => void;
  setIsProcessing: (isProcessing: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
  addQuestionFeedback: (questionId: string, feedback: QuestionFeedback) => void;
}

const initialState = {
  currentInterview: null,
  currentQuestion: null,
  questions: [],
  answers: [],
  transcription: '',
  interimTranscription: '',
  isRecording: false,
  recordingDuration: 0,
  isProcessing: false,
  error: null,
};

export const useInterviewStore = create<InterviewState>((set) => ({
  ...initialState,

  setCurrentInterview: (interview) => set({ currentInterview: interview }),

  setCurrentQuestion: (question) => set({ currentQuestion: question }),

  setQuestions: (questions) => set({ questions }),

  addAnswer: (answer) =>
    set((state) => ({
      answers: [...state.answers, answer],
    })),

  setTranscription: (text) => set({ transcription: text }),

  setInterimTranscription: (text) => set({ interimTranscription: text }),

  setIsRecording: (isRecording) => set({ isRecording }),

  setRecordingDuration: (duration) => set({ recordingDuration: duration }),

  setIsProcessing: (isProcessing) => set({ isProcessing }),

  setError: (error) => set({ error }),

  addQuestionFeedback: (questionId, feedback) =>
    set((state) => ({
      answers: state.answers.map((a) =>
        a.questionId === questionId ? { ...a, feedback } : a
      ),
    })),

  reset: () => set(initialState),
}));
