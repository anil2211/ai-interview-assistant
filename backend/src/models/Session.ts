import mongoose, { Schema } from 'mongoose';
import { ISession } from '../types';

const sessionSchema = new Schema<ISession>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    type: {
      type: String,
      enum: ['login', 'interview', 'study'],
      required: [true, 'Session type is required'],
      index: true,
    },
    status: {
      type: String,
      enum: ['active', 'expired', 'terminated'],
      default: 'active',
    },
    deviceInfo: { type: String },
    ipAddress: { type: String },
    userAgent: { type: String },
    startedAt: { type: Date, default: Date.now },
    lastActivity: { type: Date, default: Date.now },
    endedAt: { type: Date },
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

sessionSchema.index({ userId: 1, status: 1 });
sessionSchema.index({ lastActivity: 1 }, { expireAfterSeconds: 86400 * 30 });

sessionSchema.pre('save', function (next) {
  if (this.isModified('status') && (this.status === 'expired' || this.status === 'terminated')) {
    this.endedAt = new Date();
  }
  next();
});

export const Session = mongoose.model<ISession>('Session', sessionSchema);
export default Session;
