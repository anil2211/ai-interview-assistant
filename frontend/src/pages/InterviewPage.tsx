import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import QuestionCard from '@/components/QuestionCard';
import TranscriptionPanel from '@/components/TranscriptionPanel';
import AnswerPanel from '@/components/AnswerPanel';
import RecordingButton from '@/components/RecordingButton';
import FeedbackCard from '@/components/FeedbackCard';
import ModelAnswer from '@/components/ModelAnswer';
import FollowUpQuestions from '@/components/FollowUpQuestions';
import ScoreGauge from '@/components/ScoreGauge';
import { useInterview } from '@/hooks/useInterview';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { formatDuration } from '@/utils/formatters';
import type { QuestionFeedback } from '@/types';

const InterviewPage: React.FC = () => {
  useParams<{ id: string }>();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const speech = useSpeechRecognition();

  const {
    currentInterview,
    currentQuestion,
    questions,
    transcription,
    isProcessing,
    setTranscription,
    submitAnswer,
    nextQuestion,
    completeInterview,
    getFeedback,
  } = useInterview();

  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState<any>(null);
  const [showModelAnswer, setShowModelAnswer] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [viewMode, setViewMode] = useState<'split' | 'question' | 'answer'>('split');

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (speech.isRecording) {
      interval = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordingDuration(0);
    }
    return () => clearInterval(interval);
  }, [speech.isRecording]);

  const handleSubmitAnswer = async () => {
    if (!currentQuestion || !transcription.trim()) return;
    try {
      await submitAnswer({
        questionId: currentQuestion.id,
        answer: transcription,
        timeSpent: recordingDuration,
      });
      speech.stopRecording();
    } catch {
      // handled in hook
    }
  };

  const handleNextQuestion = async () => {
    try {
      await nextQuestion();
      setTranscription('');
      setShowModelAnswer(false);
    } catch {
      // handled in hook
    }
  };

  const handleComplete = async () => {
    try {
      const completed = await completeInterview();
      if (completed) {
        const fb = await getFeedback();
        setFeedback(fb);
        setShowFeedback(true);
      }
    } catch {
      // handled in hook
    }
  };

  const handleFollowUp = (question: string) => {
    setTranscription(question);
  };

  const currentQuestionIndex = questions.findIndex(
    (q) => q.id === currentQuestion?.id
  );
  const totalQuestions = questions.length;
  const progress = totalQuestions > 0 ? ((currentQuestionIndex + 1) / totalQuestions) * 100 : 0;

  if (showFeedback && feedback) {
    return (
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <div className="mx-auto mb-4 w-fit">
            <ScoreGauge score={feedback.overallScore} size={140} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Interview Complete!</h2>
          <p className="text-slate-500 dark:text-slate-400">Great effort! Here's your detailed feedback.</p>
        </motion.div>

        <div className="space-y-4">
          {feedback.detailedFeedback?.map((f: QuestionFeedback, i: number) => (
            <FeedbackCard
              key={i}
              feedback={f}
              showModelAnswer={showModelAnswer}
              onToggleModelAnswer={() => setShowModelAnswer(!showModelAnswer)}
            />
          ))}
        </div>

        <FollowUpQuestions
          questions={['How would you handle a production outage?', 'Describe your experience with microservices', 'What is your approach to testing?']}
          onSelectQuestion={handleFollowUp}
        />

        <div className="flex justify-center gap-3">
          <button onClick={() => navigate('/dashboard')} className="btn-primary">
            Back to Dashboard
          </button>
          <button onClick={() => navigate('/interview/new')} className="btn-secondary">
            New Interview
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Question {currentQuestionIndex + 1} of {totalQuestions}
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {currentInterview?.type}
              </span>
            </div>
            <div className="h-2 w-48 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
              <motion.div
                className="h-full rounded-full bg-primary-500"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isMobile && (
            <div className="flex rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
              {(['question', 'answer'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode === 'question' ? 'question' : 'answer')}
                  className={`rounded-md px-3 py-1 text-xs font-medium ${
                    viewMode === mode ? 'bg-white text-primary-600 shadow-sm dark:bg-slate-700' : 'text-slate-500'
                  }`}
                >
                  {mode === 'question' ? 'Question' : 'Answer'}
                </button>
              ))}
            </div>
          )}
          <span className="text-sm font-mono text-slate-500 dark:text-slate-400">
            {formatDuration(recordingDuration)}
          </span>
        </div>
      </div>

      <div className={`grid gap-6 ${isMobile && viewMode === 'question' ? '' : isMobile && viewMode === 'answer' ? '' : 'lg:grid-cols-2'}`}>
        {(!isMobile || viewMode === 'question') && (
          <div className="space-y-4">
            {currentQuestion && (
              <QuestionCard
                question={currentQuestion}
                questionNumber={currentQuestionIndex + 1}
                totalQuestions={totalQuestions}
              />
            )}
            <TranscriptionPanel
              transcript={transcription}
              interimTranscript={speech.interimTranscript}
              isRecording={speech.isRecording}
              confidence={speech.confidence}
            />
          </div>
        )}

        {(!isMobile || viewMode === 'answer') && (
          <div className="space-y-4">
            <AnswerPanel
              answer={transcription || 'Your answer will appear here...'}
              isLoading={isProcessing}
            />
            {showModelAnswer && currentQuestion?.modelAnswer && (
              <ModelAnswer
                modelAnswer={currentQuestion.modelAnswer}
                userAnswer={transcription}
              />
            )}
          </div>
        )}
      </div>

      <div className="glass-card fixed bottom-0 left-0 right-0 z-10 p-4 md:static md:p-6">
        <div className="mx-auto flex max-w-2xl items-center justify-center gap-4">
          <RecordingButton
            isRecording={speech.isRecording}
            duration={recordingDuration}
            onToggle={speech.toggleRecording}
            onStop={speech.stopRecording}
            disabled={isProcessing}
          />

          <button
            onClick={handleSubmitAnswer}
            disabled={!transcription.trim() || isProcessing}
            className="btn-primary text-sm"
          >
            Submit Answer
          </button>

          {currentQuestionIndex < totalQuestions - 1 ? (
            <button
              onClick={handleNextQuestion}
              disabled={isProcessing}
              className="btn-secondary text-sm"
            >
              Next Question
            </button>
          ) : (
            <button
              onClick={handleComplete}
              disabled={isProcessing}
              className="btn-primary text-sm bg-green-500 hover:bg-green-600"
            >
              Complete Interview
            </button>
          )}

          <button
            onClick={() => setShowModelAnswer(!showModelAnswer)}
            className="btn-ghost text-sm hidden md:flex"
          >
            {showModelAnswer ? 'Hide' : 'Model'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InterviewPage;
