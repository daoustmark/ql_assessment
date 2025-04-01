import { Schema, model, Types } from 'mongoose';
import { ITestSession, TestSessionStatus, TestSessionDay } from '../../types/session.types';
import { Prisma } from '@prisma/client';

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

export type TestSessionStatus = 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export type TestSession = Prisma.TestSessionGetPayload<{
  include: {
    test: {
      include: {
        questions: true;
      };
    };
  };
}>;

export const testSessionSchema = {
  id: 'string',
  testId: 'string',
  userId: 'string',
  status: 'string',
  startTime: 'date',
  endTime: 'date?',
  answers: 'object',
  createdAt: 'date',
  updatedAt: 'date',
} as const; 