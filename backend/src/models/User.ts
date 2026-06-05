import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { IUser } from '../types';
import { config } from '../config/env';

const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      minlength: [3, 'Username must be at least 3 characters'],
      maxlength: [30, 'Username must not exceed 30 characters'],
      match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    profile: {
      avatar: { type: String },
      bio: { type: String, maxlength: 500 },
      experienceLevel: {
        type: String,
        enum: ['entry', 'mid', 'senior', 'lead'],
      },
      targetRoles: [{ type: String }],
      techStack: [{ type: String }],
    },
    preferences: {
      theme: {
        type: String,
        enum: ['light', 'dark'],
        default: 'light',
      },
      language: {
        type: String,
        default: 'en',
      },
      emailNotifications: {
        type: Boolean,
        default: true,
      },
    },
    refreshToken: { type: String, select: false },
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        const r = ret as any;
        delete r.password;
        delete r.refreshToken;
        delete r.passwordResetToken;
        delete r.passwordResetExpires;
        delete r.__v;
        return r;
      },
    },
  }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.generateAuthToken = function (): string {
  const payload = {
    userId: this._id.toString(),
    role: this.role,
  };

  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiry,
  } as jwt.SignOptions);
};

userSchema.methods.generateRefreshToken = function (): string {
  const payload = {
    userId: this._id.toString(),
    role: this.role,
    type: 'refresh',
  };

  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: '30d',
  } as jwt.SignOptions);
};

export const User = mongoose.model<IUser>('User', userSchema);
export default User;
