import mongoose, { Schema } from 'mongoose';
import { IInterview } from '../types';

const interviewQuestionSchema = new Schema(
  {
    questionId: { type: Schema.Types.ObjectId, ref: 'Question', required: true },
    question: { type: String, required: true },
    answer: { type: String },
    modelAnswer: { type: String },
    score: { type: Number, min: 0, max: 100 },
    feedback: { type: String },
    timeSpent: { type: Number, min: 0 },
    aiGenerated: { type: Boolean, default: false },
  },
  { _id: false }
);

const interviewSchema = new Schema<IInterview>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    type: {
      type: String,
      enum: ['coding', 'devops', 'cloud', 'system-design', 'behavioral'],
      required: [true, 'Interview type is required'],
    },
    status: {
      type: String,
      enum: ['in-progress', 'completed', 'cancelled'],
      default: 'in-progress',
    },
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      required: [true, 'Difficulty level is required'],
    },
    questions: [interviewQuestionSchema],
    overallScore: { type: Number, min: 0, max: 100 },
    strengths: [{ type: String }],
    weaknesses: [{ type: String }],
    duration: { type: Number, min: 0 },
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        const r = ret as any;
        r.id = r._id.toString();
        delete r.__v;
        return r;
      },
    },
  }
);

interviewSchema.index({ userId: 1, status: 1 });
interviewSchema.index({ userId: 1, type: 1 });
interviewSchema.index({ userId: 1, createdAt: -1 });

interviewSchema.pre('save', function (next) {
  if (this.isModified('status') && this.status === 'completed' && !this.completedAt) {
    this.completedAt = new Date();
    if (this.startedAt) {
      this.duration = Math.floor((this.completedAt.getTime() - this.startedAt.getTime()) / 1000);
    }
  }
  next();
});

export const Interview = mongoose.model<IInterview>('Interview', interviewSchema);
export default Interview;
