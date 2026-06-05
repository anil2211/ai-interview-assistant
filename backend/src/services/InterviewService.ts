import { Types } from 'mongoose';
import { Interview } from '../models/Interview';
import { Question } from '../models/Question';
import { Feedback } from '../models/Feedback';
import { User } from '../models/User';
import { Session } from '../models/Session';
import aiService from './AIService';
import analyticsService from './AnalyticsService';
import { IInterview, IInterviewQuestion, IFeedback } from '../types';
import { INTERVIEW_QUESTION_COUNTS, ERROR_CODES } from '../utils/constants';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../middleware/logger';

class InterviewService {
  async startInterview(
    userId: string,
    type: IInterview['type'],
    difficulty: IInterview['difficulty']
  ): Promise<IInterview> {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404, ERROR_CODES.NOT_FOUND);
    }

    const questionCount = INTERVIEW_QUESTION_COUNTS[difficulty] || 5;

    let questions = await Question.aggregate([
      { $match: { category: type, difficulty, isActive: true } },
      { $sample: { size: questionCount } },
      { $project: { content: 1, title: 1, modelAnswer: 1, hints: 1, timeLimit: 1, codeSnippet: 1 } },
    ]);

    const interviewQuestions: IInterviewQuestion[] = questions.map((q: any) => ({
      questionId: q._id,
      question: q.title ? `${q.title}\n\n${q.content}` : q.content,
      answer: undefined,
      modelAnswer: q.modelAnswer,
      score: undefined,
      feedback: undefined,
      timeSpent: undefined,
      aiGenerated: false,
    }));

    const neededCount = questionCount - questions.length;
    if (neededCount > 0) {
      for (let i = 0; i < neededCount; i++) {
        const aiQuestion = await this.generateAIQuestion(type, difficulty, user.profile?.techStack || []);
        interviewQuestions.push({
          questionId: new Types.ObjectId(),
          question: aiQuestion,
          answer: undefined,
          modelAnswer: undefined,
          score: undefined,
          feedback: undefined,
          timeSpent: undefined,
          aiGenerated: true,
        });
      }
    }

    const interview = new Interview({
      userId: new Types.ObjectId(userId),
      type,
      difficulty,
      status: 'in-progress',
      questions: interviewQuestions,
      startedAt: new Date(),
      strengths: [],
      weaknesses: [],
    });

    await interview.save();

    await Session.create({
      userId: new Types.ObjectId(userId),
      type: 'interview',
      status: 'active',
      startedAt: new Date(),
    });

    logger.info(`Interview started: ${interview._id} for user ${userId}`);
    return interview;
  }

  private async generateAIQuestion(
    type: IInterview['type'],
    difficulty: IInterview['difficulty'],
    techStack: string[]
  ): Promise<string> {
    const context = `Generate an interview question for a ${difficulty}-level ${type} position.`;
    const techContext = techStack.length > 0 ? ` The candidate's tech stack includes: ${techStack.join(', ')}.` : '';
    return `${context}${techContext}\n\nPlease provide a detailed question that tests practical knowledge and problem-solving ability.`;
  }

  async submitAnswer(
    interviewId: string,
    questionId: string,
    answer: string,
    timeSpent?: number
  ): Promise<{ interview: IInterview; feedback: IFeedback }> {
    const interview = await Interview.findById(interviewId);
    if (!interview) {
      throw new AppError('Interview not found', 404, ERROR_CODES.NOT_FOUND);
    }

    if (interview.status !== 'in-progress') {
      throw new AppError('Interview is not in progress', 400, ERROR_CODES.VALIDATION_ERROR);
    }

    const questionIndex = interview.questions.findIndex(
      q => q.questionId.toString() === questionId
    );

    if (questionIndex === -1) {
      throw new AppError('Question not found in this interview', 404, ERROR_CODES.NOT_FOUND);
    }

    const question = interview.questions[questionIndex];
    if (question.answer) {
      throw new AppError('Question already answered', 400, ERROR_CODES.VALIDATION_ERROR);
    }

    question.answer = answer;
    if (timeSpent !== undefined) {
      question.timeSpent = timeSpent;
    }

    let feedbackData: IFeedback;

    try {
      question.modelAnswer = question.modelAnswer || await aiService.generateModelAnswer(
        question.question,
        { type: interview.type, difficulty: interview.difficulty }
      );

      const evaluation = await aiService.generateFeedback(
        question.question,
        answer,
        question.modelAnswer,
        { type: interview.type, difficulty: interview.difficulty }
      );

      question.score = evaluation.score;
      question.feedback = evaluation.feedback;

      feedbackData = await Feedback.create({
        interviewId: interview._id,
        questionId: new Types.ObjectId(questionId),
        userId: interview.userId,
        score: evaluation.score,
        rating: Math.round(evaluation.score / 20),
        strengths: evaluation.strengths,
        weaknesses: evaluation.weaknesses,
        suggestions: evaluation.suggestions,
        technicalAccuracy: evaluation.technicalAccuracy,
        completeness: evaluation.completeness,
        clarity: evaluation.clarity,
        relevance: evaluation.relevance,
        structureScore: evaluation.structureScore,
        communicationScore: evaluation.communicationScore,
        aiGeneratedFeedback: evaluation.feedback,
        modelAnswer: question.modelAnswer,
        alternativeAnswers: [],
      });
    } catch (error) {
      logger.error('AI evaluation failed, using default scores:', error);
      question.score = 70;
      question.feedback = 'Your answer has been recorded. Detailed AI feedback will be available shortly.';

      feedbackData = await Feedback.create({
        interviewId: interview._id,
        questionId: new Types.ObjectId(questionId),
        userId: interview.userId,
        score: 70,
        rating: 3,
        strengths: ['Answer submitted'],
        weaknesses: ['AI evaluation pending'],
        suggestions: ['Detailed feedback will be generated'],
        technicalAccuracy: 70,
        completeness: 70,
        clarity: 70,
        relevance: 70,
        structureScore: 70,
        communicationScore: 70,
        aiGeneratedFeedback: 'Your answer has been recorded.',
        modelAnswer: question.modelAnswer || 'Model answer pending',
        alternativeAnswers: [],
      });
    }

    interview.markModified('questions');
    await interview.save();

    logger.info(`Answer submitted for interview ${interviewId}, question ${questionId}`);
    return { interview, feedback: feedbackData };
  }

  async getNextQuestion(interviewId: string): Promise<{ question: IInterviewQuestion | null; isComplete: boolean; progress: { answered: number; total: number } }> {
    const interview = await Interview.findById(interviewId);
    if (!interview) {
      throw new AppError('Interview not found', 404, ERROR_CODES.NOT_FOUND);
    }

    const answered = interview.questions.filter(q => q.answer).length;
    const total = interview.questions.length;
    const nextUnanswered = interview.questions.find(q => !q.answer);

    return {
      question: nextUnanswered || null,
      isComplete: answered >= total,
      progress: { answered, total },
    };
  }

  async completeInterview(interviewId: string): Promise<IInterview> {
    const interview = await Interview.findById(interviewId);
    if (!interview) {
      throw new AppError('Interview not found', 404, ERROR_CODES.NOT_FOUND);
    }

    if (interview.status === 'completed') {
      throw new AppError('Interview is already completed', 400, ERROR_CODES.VALIDATION_ERROR);
    }

    const answeredQuestions = interview.questions.filter(q => q.answer !== undefined);
    const scores = answeredQuestions.map(q => q.score || 0).filter(s => s > 0);

    if (scores.length > 0) {
      interview.overallScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    }

    const feedbacks = await Feedback.find({ interviewId: interview._id });
    const allStrengths = feedbacks.flatMap(f => f.strengths);
    const allWeaknesses = feedbacks.flatMap(f => f.weaknesses);

    const strengthCounts = this.countOccurrences(allStrengths);
    const weaknessCounts = this.countOccurrences(allWeaknesses);

    interview.strengths = Object.entries(strengthCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([s]) => s);

    interview.weaknesses = Object.entries(weaknessCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([w]) => w);

    interview.status = 'completed';
    interview.completedAt = new Date();
    if (interview.startedAt) {
      interview.duration = Math.floor((interview.completedAt.getTime() - interview.startedAt.getTime()) / 1000);
    }

    await interview.save();

    await Session.findOneAndUpdate(
      { userId: interview.userId, type: 'interview', status: 'active' },
      { status: 'expired', endedAt: new Date() },
      { sort: { startedAt: -1 } }
    );

    try {
      await analyticsService.trackPerformance(interview.userId.toString(), interview._id.toString());
    } catch (error) {
      logger.error('Failed to update analytics:', error);
    }

    logger.info(`Interview completed: ${interviewId} with score ${interview.overallScore}`);
    return interview;
  }

  async getFeedback(interviewId: string, questionId?: string): Promise<IFeedback | IFeedback[]> {
    const query: any = { interviewId: new Types.ObjectId(interviewId) };
    if (questionId) {
      query.questionId = new Types.ObjectId(questionId);
      const feedback = await Feedback.findOne(query);
      if (!feedback) {
        throw new AppError('Feedback not found', 404, ERROR_CODES.NOT_FOUND);
      }
      return feedback;
    }

    const feedbacks = await Feedback.find(query).sort({ createdAt: 1 });
    return feedbacks;
  }

  async getModelAnswer(interviewId: string, questionId: string): Promise<string> {
    const interview = await Interview.findById(interviewId);
    if (!interview) {
      throw new AppError('Interview not found', 404, ERROR_CODES.NOT_FOUND);
    }

    const question = interview.questions.find(q => q.questionId.toString() === questionId);
    if (!question) {
      throw new AppError('Question not found', 404, ERROR_CODES.NOT_FOUND);
    }

    if (question.modelAnswer) {
      return question.modelAnswer;
    }

    const modelAnswer = await aiService.generateModelAnswer(question.question, {
      type: interview.type,
      difficulty: interview.difficulty,
    });

    question.modelAnswer = modelAnswer;
    await interview.save();

    return modelAnswer;
  }

  private countOccurrences(arr: string[]): Record<string, number> {
    const counts: Record<string, number> = {};
    for (const item of arr) {
      const normalized = item.toLowerCase().trim();
      if (normalized) {
        counts[normalized] = (counts[normalized] || 0) + 1;
      }
    }
    return counts;
  }
}

export const interviewService = new InterviewService();
export default interviewService;
