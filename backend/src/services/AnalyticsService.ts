import { Types } from 'mongoose';
import { Interview } from '../models/Interview';
import { Feedback } from '../models/Feedback';
import { StudyPlan } from '../models/StudyPlan';
import { IAnalytics } from '../types';
import { logger } from '../middleware/logger';
import { INTERVIEW_TYPES } from '../utils/constants';

class AnalyticsService {
  async trackPerformance(userId: string, interviewId: string): Promise<void> {
    try {
      const interview = await Interview.findById(interviewId);
      if (!interview) return;

      const feedbacks = await Feedback.find({ interviewId: new Types.ObjectId(interviewId) });

      const categoryScores: Record<string, number[]> = {};
      for (const feedback of feedbacks) {
        const category = interview.type;
        if (!categoryScores[category]) {
          categoryScores[category] = [];
        }
        categoryScores[category].push(feedback.score);
      }

      logger.info(`Performance tracked for user ${userId} on interview ${interviewId}`);
    } catch (error) {
      logger.error('Failed to track performance:', error);
    }
  }

  async generateWeaknessAnalysis(userId: string): Promise<{ category: string; score: number; frequency: number; recommendations: string[] }[]> {
    const interviews = await Interview.find({
      userId: new Types.ObjectId(userId),
      status: 'completed',
    }).sort({ completedAt: -1 }).limit(20);

    if (interviews.length === 0) {
      return [];
    }

    const interviewIds = interviews.map(i => i._id);
    const feedbacks = await Feedback.find({ interviewId: { $in: interviewIds } });

    const categoryPerformance: Record<string, { scores: number[]; count: number }> = {};

    for (const feedback of feedbacks) {
      const interview = interviews.find(i => i._id.equals(feedback.interviewId));
      const category = interview?.type || 'unknown';

      if (!categoryPerformance[category]) {
        categoryPerformance[category] = { scores: [], count: 0 };
      }
      categoryPerformance[category].scores.push(feedback.score);
      categoryPerformance[category].count++;
    }

    return Object.entries(categoryPerformance)
      .map(([category, data]) => {
        const avgScore = data.scores.length > 0
          ? Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length)
          : 0;

        const recommendations = this.getRecommendations(category, avgScore);

        return {
          category,
          score: avgScore,
          frequency: data.count,
          recommendations,
        };
      })
      .sort((a, b) => a.score - b.score);
  }

  async generateStrengthAnalysis(userId: string): Promise<{ category: string; score: number; frequency: number; insights: string[] }[]> {
    const weaknesses = await this.generateWeaknessAnalysis(userId);

    return weaknesses
      .map(w => ({
        category: w.category,
        score: w.score,
        frequency: w.frequency,
        insights: this.getStrengthInsights(w.category, w.score),
      }))
      .sort((a, b) => b.score - a.score);
  }

  async getProgressOverTime(
    userId: string,
    period: '7d' | '30d' | '90d' | 'all' = '30d'
  ): Promise<{ date: string; score: number; type: string }[]> {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 86400000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 86400000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 86400000);
        break;
      default:
        startDate = new Date(0);
    }

    const interviews = await Interview.find({
      userId: new Types.ObjectId(userId),
      status: 'completed',
      completedAt: { $gte: startDate },
    }).sort({ completedAt: 1 });

    return interviews
      .filter(i => i.overallScore !== undefined)
      .map(i => ({
        date: i.completedAt?.toISOString().split('T')[0] || '',
        score: i.overallScore || 0,
        type: i.type,
      }));
  }

  async getCategoryBreakdown(userId: string): Promise<{ category: string; averageScore: number; interviewsCount: number; bestScore: number; worstScore: number; recentTrend: string }[]> {
    const interviews = await Interview.find({
      userId: new Types.ObjectId(userId),
      status: 'completed',
    }).sort({ completedAt: -1 });

    if (interviews.length === 0) {
      return INTERVIEW_TYPES.map(type => ({
        category: type,
        averageScore: 0,
        interviewsCount: 0,
        bestScore: 0,
        worstScore: 0,
        recentTrend: 'neutral',
      }));
    }

    const categoryData: Record<string, { scores: number[]; dates: Date[] }> = {};

    for (const interview of interviews) {
      const cat = interview.type;
      if (!categoryData[cat]) {
        categoryData[cat] = { scores: [], dates: [] };
      }
      if (interview.overallScore !== undefined) {
        categoryData[cat].scores.push(interview.overallScore);
        categoryData[cat].dates.push(interview.completedAt || interview.createdAt);
      }
    }

    return Object.entries(categoryData).map(([category, data]) => {
      const avgScore = data.scores.length > 0
        ? Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length)
        : 0;

      const recentScores = data.scores.slice(-3);
      const trend = recentScores.length >= 2
        ? recentScores[recentScores.length - 1] - recentScores[0]
        : 0;

      return {
        category,
        averageScore: avgScore,
        interviewsCount: data.scores.length,
        bestScore: Math.max(...data.scores, 0),
        worstScore: Math.min(...data.scores, 100),
        recentTrend: trend > 5 ? 'improving' : trend < -5 ? 'declining' : 'stable',
      };
    });
  }

  async getDashboard(userId: string): Promise<IAnalytics> {
    const interviews = await Interview.find({
      userId: new Types.ObjectId(userId),
      status: 'completed',
    });

    const studyPlans = await StudyPlan.find({
      userId: new Types.ObjectId(userId),
      isActive: true,
    });

    const totalInterviews = interviews.length;
    const scores = interviews.map(i => i.overallScore || 0).filter(s => s > 0);
    const averageScore = scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;

    const totalStudyHours = studyPlans.reduce((sum, plan) => sum + (plan.progress?.hoursSpent || 0), 0);
    const completedTopics = studyPlans.reduce((sum, plan) => sum + (plan.progress?.topicsCompleted || 0), 0);

    const categoryScores: Record<string, number> = {};
    for (const type of INTERVIEW_TYPES) {
      const typeInterviews = interviews.filter(i => i.type === type);
      const typeScores = typeInterviews.map(i => i.overallScore || 0).filter(s => s > 0);
      categoryScores[type] = typeScores.length > 0
        ? Math.round(typeScores.reduce((a, b) => a + b, 0) / typeScores.length)
        : 0;
    }

    const weaknesses = await this.generateWeaknessAnalysis(userId);
    const strengths = await this.generateStrengthAnalysis(userId);

    const progress = await this.getProgressOverTime(userId, '30d');

    return {
      userId: new Types.ObjectId(userId),
      totalInterviews,
      averageScore,
      totalStudyHours,
      completedTopics,
      categoryScores,
      strengthAreas: strengths.filter(s => s.score >= 70).map(s => s.category),
      weakAreas: weaknesses.filter(w => w.score < 60).map(w => w.category),
      progressOverTime: progress.map(p => ({ date: new Date(p.date), score: p.score })),
      lastActiveAt: interviews.length > 0
        ? interviews[0].completedAt || interviews[0].createdAt
        : new Date(),
    };
  }

  private getRecommendations(category: string, score: number): string[] {
    const base: Record<string, string[]> = {
      coding: [
        'Practice data structures and algorithms on LeetCode',
        'Focus on time and space complexity analysis',
        'Study common coding patterns',
      ],
      devops: [
        'Practice with CI/CD pipelines',
        'Study containerization and orchestration',
        'Learn infrastructure as code tools',
      ],
      cloud: [
        'Get hands-on with major cloud providers',
        'Study cloud architecture patterns',
        'Practice cost optimization strategies',
      ],
      'system-design': [
        'Study scalable system architectures',
        'Practice designing distributed systems',
        'Learn about trade-offs in system design',
      ],
      behavioral: [
        'Practice STAR method responses',
        'Prepare concrete examples from experience',
        'Work on storytelling skills',
      ],
    };

    const recommendations = base[category] || ['Review fundamentals', 'Practice with mock questions'];
    return score < 60 ? recommendations : recommendations.slice(0, 1);
  }

  private getStrengthInsights(category: string, score: number): string[] {
    if (score < 70) return ['Room for improvement'];

    return [
      `Strong performance in ${category} interviews`,
      `Consider mentoring others in ${category}`,
    ];
  }
}

export const analyticsService = new AnalyticsService();
export default analyticsService;
