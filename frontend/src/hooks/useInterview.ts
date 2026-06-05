import { useCallback } from 'react';
import { useInterviewStore } from '@/store/interviewStore';
import * as interviewService from '@/services/interview';
import * as websocketService from '@/services/websocket';
import type { StartInterviewRequest, SubmitAnswerRequest } from '@/services/interview';
import type { QuestionFeedback } from '@/types';
import toast from 'react-hot-toast';

export function useInterview() {
  const {
    currentInterview,
    currentQuestion,
    questions,
    answers,
    transcription,
    isRecording,
    isProcessing,
    setCurrentInterview,
    setCurrentQuestion,
    setQuestions,
    addAnswer,
    setTranscription,
    setIsRecording,
    setIsProcessing,
    setError,
    reset,
  } = useInterviewStore();

  const startInterview = useCallback(
    async (data: StartInterviewRequest) => {
      setIsProcessing(true);
      setError(null);
      try {
        const interview = await interviewService.startInterview(data);
        setCurrentInterview(interview);
        setQuestions(interview.questions);
        if (interview.questions.length > 0) {
          setCurrentQuestion(interview.questions[0]);
        }
        websocketService.joinInterview(interview.id);
        toast.success('Interview started!');
        return interview;
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Failed to start interview';
        setError(message);
        toast.error(message);
        throw err;
      } finally {
        setIsProcessing(false);
      }
    },
    [setCurrentInterview, setQuestions, setCurrentQuestion, setIsProcessing, setError]
  );

  const submitAnswer = useCallback(
    async (data: SubmitAnswerRequest) => {
      if (!currentInterview) return;
      setIsProcessing(true);
      try {
        const answer = await interviewService.submitAnswer(
          currentInterview.id,
          data
        );
        addAnswer(answer);
        toast.success('Answer submitted');
        return answer;
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Failed to submit answer';
        setError(message);
        toast.error(message);
        throw err;
      } finally {
        setIsProcessing(false);
      }
    },
    [currentInterview, addAnswer, setIsProcessing, setError]
  );

  const nextQuestion = useCallback(async () => {
    if (!currentInterview) return;
    setIsProcessing(true);
    try {
      const question = await interviewService.getNextQuestion(
        currentInterview.id
      );
      setCurrentQuestion(question);
      setTranscription('');
      return question;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to get next question';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setIsProcessing(false);
    }
  }, [
    currentInterview,
    setCurrentQuestion,
    setTranscription,
    setIsProcessing,
    setError,
  ]);

  const completeInterview = useCallback(async () => {
    if (!currentInterview) return;
    setIsProcessing(true);
    try {
      const interview = await interviewService.completeInterview(
        currentInterview.id
      );
      setCurrentInterview(interview);
      websocketService.leaveInterview(currentInterview.id);
      toast.success('Interview completed!');
      return interview;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to complete interview';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setIsProcessing(false);
    }
  }, [
    currentInterview,
    setCurrentInterview,
    setIsProcessing,
    setError,
  ]);

  const getFeedback = useCallback(async () => {
    if (!currentInterview) return;
    try {
      const feedback = await interviewService.getFeedback(
        currentInterview.id
      );
      return feedback;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to get feedback';
      toast.error(message);
      throw err;
    }
  }, [currentInterview]);

  const addQuestionFeedback = useCallback(
    (questionId: string, feedback: QuestionFeedback) => {
      useInterviewStore.getState().addQuestionFeedback(questionId, feedback);
    },
    []
  );

  return {
    currentInterview,
    currentQuestion,
    questions,
    answers,
    transcription,
    isRecording,
    isProcessing,
    setTranscription,
    setIsRecording,
    setCurrentQuestion,
    startInterview,
    submitAnswer,
    nextQuestion,
    completeInterview,
    getFeedback,
    addQuestionFeedback,
    reset,
  };
}
