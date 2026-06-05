import mongoose, { Schema } from 'mongoose';
import { IStudyPlan } from '../types';

const studyPlanTopicSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    priority: {
      type: String,
      enum: ['high', 'medium', 'low'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['not-started', 'in-progress', 'completed'],
      default: 'not-started',
    },
    resources: [{ type: String }],
  },
  { _id: false }
);

const studyPlanScheduleSchema = new Schema(
  {
    date: { type: Date, required: true },
    topic: { type: String, required: true },
    duration: { type: Number, required: true, min: 0 },
    completed: { type: Boolean, default: false },
  },
  { _id: false }
);

const studyPlanProgressSchema = new Schema(
  {
    overallPercentage: { type: Number, default: 0, min: 0, max: 100 },
    topicsCompleted: { type: Number, default: 0 },
    hoursSpent: { type: Number, default: 0 },
  },
  { _id: false }
);

const studyPlanSchema = new Schema<IStudyPlan>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: 1000,
    },
    goals: [{ type: String }],
    targetDate: { type: Date },
    dailyGoal: {
      type: Number,
      default: 2,
      min: 0.5,
      max: 24,
    },
    topics: [studyPlanTopicSchema],
    schedule: [studyPlanScheduleSchema],
    progress: {
      type: studyPlanProgressSchema,
      default: () => ({ overallPercentage: 0, topicsCompleted: 0, hoursSpent: 0 }),
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        delete (ret as any).__v;
        return ret;
      },
    },
  }
);

studyPlanSchema.index({ userId: 1, isActive: 1 });
studyPlanSchema.index({ userId: 1, createdAt: -1 });

export const StudyPlan = mongoose.model<IStudyPlan>('StudyPlan', studyPlanSchema);
export default StudyPlan;
