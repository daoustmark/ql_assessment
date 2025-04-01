import { Types } from 'mongoose';

export type TestSessionStatus = 'pending' | 'in-progress' | 'completed';
export type TestSessionDay = 1 | 2;

export interface ITestSession {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  startDate: Date;
  endDate?: Date;
  day: TestSessionDay;
  status: TestSessionStatus;
  currentSection?: Types.ObjectId;
  sections: Types.ObjectId[];
  progress: {
    sectionsCompleted: number;
    totalSections: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface ITestSessionCreate {
  user: Types.ObjectId;
  day: TestSessionDay;
  sections: Types.ObjectId[];
}

export interface ITestSessionUpdate {
  status?: TestSessionStatus;
  currentSection?: Types.ObjectId;
  endDate?: Date;
  progress?: {
    sectionsCompleted: number;
    totalSections: number;
  };
} 