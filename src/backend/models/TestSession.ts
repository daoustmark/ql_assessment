import { Schema, model, Types } from 'mongoose';
import { ITestSession, TestSessionStatus, TestSessionDay } from '../../types/session.types';

const testSessionSchema = new Schema<ITestSession>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
    },
    day: {
      type: Number,
      enum: [1, 2] as TestSessionDay[],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed'] as TestSessionStatus[],
      default: 'pending',
    },
    currentSection: {
      type: Schema.Types.ObjectId,
      ref: 'Section',
    },
    sections: [{
      type: Schema.Types.ObjectId,
      ref: 'Section',
      required: true,
    }],
    progress: {
      sectionsCompleted: {
        type: Number,
        default: 0,
        min: 0,
      },
      totalSections: {
        type: Number,
        required: true,
        min: 1,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
testSessionSchema.index({ user: 1, status: 1, day: 1 });
testSessionSchema.index({ user: 1, day: 1 }, { unique: true });

export const TestSession = model<ITestSession>('TestSession', testSessionSchema); 