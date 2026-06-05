import mongoose, { Schema } from 'mongoose';
import { IFeedback } from '../types';

const feedbackSchema = new Schema<IFeedback>(
  {
    interviewId: {
      type: Schema.Types.ObjectId,
      ref: 'Interview',
      required: [true, 'Interview ID is required'],
      index: true,
    },
    questionId: {
      type: Schema.Types.ObjectId,
      ref: 'Question',
      required: [true, 'Question ID is required'],
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    score: {
      type: Number,
      required: [true, 'Score is required'],
      min: 0,
      max: 100,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    strengths: [{ type: String }],
    weaknesses: [{ type: String }],
    suggestions: [{ type: String }],
    technicalAccuracy: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    completeness: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    clarity: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    relevance: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    structureScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    communicationScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    aiGeneratedFeedback: { type: String },
    modelAnswer: { type: String },
    alternativeAnswers: [{ type: String }],
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

feedbackSchema.index({ interviewId: 1, questionId: 1 }, { unique: true });
feedbackSchema.index({ userId: 1, createdAt: -1 });

export const Feedback = mongoose.model<IFeedback>('Feedback', feedbackSchema);
export default Feedback;
