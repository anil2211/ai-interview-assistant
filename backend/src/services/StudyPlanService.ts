import { Types } from 'mongoose';
import { StudyPlan } from '../models/StudyPlan';
import { User } from '../models/User';
import { Feedback } from '../models/Feedback';
import aiService from './AIService';
import { IStudyPlan, IStudyPlanTopic, IStudyPlanSchedule } from '../types';
import { ERROR_CODES } from '../utils/constants';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../middleware/logger';

class StudyPlanService {
  async generatePlan(userId: string): Promise<IStudyPlan> {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404, ERROR_CODES.NOT_FOUND);
    }

    const feedbacks = await Feedback.find({
      userId: new Types.ObjectId(userId),
    }).sort({ createdAt: -1 }).limit(50);

    const weaknesses = this.extractWeaknesses(feedbacks);

    const aiPlan = await aiService.generateStudyPlan(
      user.toObject(),
      weaknesses,
      user.profile?.targetRoles?.[0]
    );

    const plan = new StudyPlan({
      userId: new Types.ObjectId(userId),
      title: aiPlan.title || 'Personalized Interview Preparation Plan',
      description: aiPlan.description || 'AI-generated study plan based on your performance and goals.',
      goals: aiPlan.goals || ['Improve interview performance', 'Build technical confidence', 'Master core concepts'],
      targetDate: aiPlan.targetDate || new Date(Date.now() + 90 * 86400000),
      dailyGoal: 2,
      topics: aiPlan.topics || this.generateDefaultTopics(),
      schedule: aiPlan.schedule || this.generateDefaultSchedule(),
      progress: {
        overallPercentage: 0,
        topicsCompleted: 0,
        hoursSpent: 0,
      },
      isActive: true,
    });

    await plan.save();
    logger.info(`Study plan generated for user ${userId}: ${plan._id}`);
    return plan;
  }

  async updateProgress(
    planId: string,
    topicName: string,
    durationSpent: number
  ): Promise<IStudyPlan> {
    const plan = await StudyPlan.findById(planId);
    if (!plan) {
      throw new AppError('Study plan not found', 404, ERROR_CODES.NOT_FOUND);
    }

    const topic = plan.topics.find(t => t.name === topicName);
    if (topic && topic.status === 'not-started') {
      topic.status = 'in-progress';
    }

    const scheduleEntry = plan.schedule.find(
      s => s.topic === topicName && !s.completed
    );
    if (scheduleEntry) {
      scheduleEntry.completed = true;
    }

    plan.progress.hoursSpent = (plan.progress.hoursSpent || 0) + durationSpent;

    if (topic && scheduleEntry?.completed) {
      topic.status = 'completed';
      plan.progress.topicsCompleted = plan.topics.filter(t => t.status === 'completed').length;
    }

    const completedTopics = plan.topics.filter(t => t.status === 'completed').length;
    plan.progress.overallPercentage = plan.topics.length > 0
      ? Math.round((completedTopics / plan.topics.length) * 100)
      : 0;

    await plan.save();
    return plan;
  }

  async getRecommendedResources(userId: string, topic: string): Promise<string[]> {
    const user = await User.findById(userId);
    const resources: string[] = [];

    if (user?.profile?.techStack?.length) {
      resources.push(...user.profile.techStack.map(
        tech => `${tech} official documentation and best practices`
      ));
    }

    resources.push(
      `Comprehensive guide to ${topic}`,
      `Practice exercises for ${topic}`,
      `Advanced ${topic} concepts`,
      `Real-world ${topic} case studies`,
      `${topic} interview questions and answers`
    );

    return resources.slice(0, 10);
  }

  async adjustPlan(planId: string, feedback: string): Promise<IStudyPlan> {
    const plan = await StudyPlan.findById(planId);
    if (!plan) {
      throw new AppError('Study plan not found', 404, ERROR_CODES.NOT_FOUND);
    }

    logger.info(`Adjusting plan ${planId} based on feedback: ${feedback}`);

    if (feedback.toLowerCase().includes('too easy') || feedback.toLowerCase().includes('advanced')) {
      for (const topic of plan.topics) {
        if (topic.status === 'completed') continue;
        topic.priority = 'high';
      }
      plan.dailyGoal = Math.min(plan.dailyGoal + 1, 8);
    }

    if (feedback.toLowerCase().includes('too hard') || feedback.toLowerCase().includes('difficult')) {
      const pendingTopics = plan.topics.filter(t => t.status !== 'completed');
      if (pendingTopics.length > 0) {
        pendingTopics[0].priority = 'low';
      }
      plan.dailyGoal = Math.max(plan.dailyGoal - 0.5, 0.5);
    }

    if (feedback.toLowerCase().includes('more practice')) {
      for (let i = 0; i < Math.min(3, plan.schedule.length); i++) {
        if (!plan.schedule[i].completed) {
          plan.schedule[i].duration = Math.round(plan.schedule[i].duration * 1.5);
        }
      }
    }

    await plan.save();
    return plan;
  }

  private extractWeaknesses(feedbacks: any[]): string[] {
    const weaknessCount: Record<string, number> = {};
    for (const fb of feedbacks) {
      for (const w of fb.weaknesses || []) {
        const key = w.toLowerCase().trim();
        weaknessCount[key] = (weaknessCount[key] || 0) + 1;
      }
    }

    return Object.entries(weaknessCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([w]) => w);
  }

  private generateDefaultTopics(): IStudyPlanTopic[] {
    return [
      { name: 'Data Structures & Algorithms', priority: 'high', status: 'not-started', resources: [] },
      { name: 'System Design', priority: 'high', status: 'not-started', resources: [] },
      { name: 'Behavioral Interview Prep', priority: 'medium', status: 'not-started', resources: [] },
      { name: 'Technical Communication', priority: 'medium', status: 'not-started', resources: [] },
      { name: 'Mock Interviews', priority: 'high', status: 'not-started', resources: [] },
    ];
  }

  private generateDefaultSchedule(): IStudyPlanSchedule[] {
    const schedule: IStudyPlanSchedule[] = [];
    const topics = ['Data Structures & Algorithms', 'System Design', 'Behavioral Interview Prep', 'Technical Communication', 'Mock Interviews'];

    for (let day = 0; day < 30; day++) {
      schedule.push({
        date: new Date(Date.now() + day * 86400000),
        topic: topics[day % topics.length],
        duration: 120,
        completed: false,
      });
    }

    return schedule;
  }
}

export const studyPlanService = new StudyPlanService();
export default studyPlanService;
