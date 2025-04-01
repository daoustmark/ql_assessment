import { Types } from 'mongoose';
import { QuestionType } from './question.types';

export interface IBaseResponse {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  question: Types.ObjectId;
  session: Types.ObjectId;
  section: Types.ObjectId;
  submittedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMultipleChoiceResponse extends IBaseResponse {
  type: 'multiple-choice';
  value: number;
  isCorrect?: boolean;
}

export interface ITextResponse extends IBaseResponse {
  type: 'text';
  value: string;
  score?: number;
  scoringNotes?: string;
}

export interface IVideoResponse extends IBaseResponse {
  type: 'video';
  videoUrl: string;
  duration: number;
  score?: number;
  scoringNotes?: string;
}

export interface IForcedChoiceResponse extends IBaseResponse {
  type: 'forced-choice';
  value: number;
  score?: number;
  scoringNotes?: string;
}

export interface ILikertResponse extends IBaseResponse {
  type: 'likert';
  value: number;
}

export interface IOpenEndedResponse extends IBaseResponse {
  type: 'open-ended';
  value: string;
  score?: number;
  scoringNotes?: string;
}

export type IResponse = 
  | IMultipleChoiceResponse
  | ITextResponse
  | IVideoResponse
  | IForcedChoiceResponse
  | ILikertResponse
  | IOpenEndedResponse;

export interface IResponseCreate {
  type: QuestionType;
  user: Types.ObjectId;
  question: Types.ObjectId;
  session: Types.ObjectId;
  section: Types.ObjectId;
  value: number | string;
  videoUrl?: string;
  duration?: number;
}

export interface IResponseUpdate {
  score?: number;
  scoringNotes?: string;
  isCorrect?: boolean;
} 