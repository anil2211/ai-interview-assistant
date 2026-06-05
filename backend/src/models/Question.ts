import mongoose, { Schema } from 'mongoose';
import { IQuestion } from '../types';

const questionSchema = new Schema<IQuestion>(
  {
    category: {
      type: String,
      enum: ['coding', 'devops', 'cloud', 'system-design', 'behavioral'],
      required: [true, 'Category is required'],
      index: true,
    },
    subcategory: {
      type: String,
      required: [true, 'Subcategory is required'],
      trim: true,
    },
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      required: [true, 'Difficulty is required'],
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
      maxlength: 500,
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
    },
    modelAnswer: {
      type: String,
      required: [true, 'Model answer is required'],
    },
    hints: [{ type: String }],
    tags: [{ type: String, lowercase: true }],
    expectedTopics: [{ type: String, lowercase: true }],
    timeLimit: {
      type: Number,
      default: 300,
      min: 30,
      max: 3600,
    },
    codeSnippet: { type: String },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
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

questionSchema.index({ category: 1, difficulty: 1 });
questionSchema.index({ tags: 1 });
questionSchema.index({ category: 1, subcategory: 1 });

export const Question = mongoose.model<IQuestion>('Question', questionSchema);
export default Question;
