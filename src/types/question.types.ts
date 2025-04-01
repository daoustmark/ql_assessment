import { Types } from 'mongoose';

export type QuestionType = 
  | 'multiple-choice'
  | 'text'
  | 'video'
  | 'forced-choice'
  | 'likert'
  | 'open-ended';

export interface IScoringRubric {
  criteria: string;
  levels: {
    score: number;
    description: string;
  }[];
}

export interface IBaseQuestion {
  _id: Types.ObjectId;
  type: QuestionType;
  content: string;
  section: Types.ObjectId;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMultipleChoiceQuestion extends IBaseQuestion {
  type: 'multiple-choice';
  options: string[];
  correctOption: number;
}

export interface ITextQuestion extends IBaseQuestion {
  type: 'text';
  maxLength?: number;
  scoringRubric?: IScoringRubric;
}

export interface IVideoQuestion extends IBaseQuestion {
  type: 'video';
  maxDuration?: number; // in seconds
  scoringRubric?: IScoringRubric;
}

export interface IForcedChoiceQuestion extends IBaseQuestion {
  type: 'forced-choice';
  options: string[];
  scoringRubric?: IScoringRubric;
}

export interface ILikertQuestion extends IBaseQuestion {
  type: 'likert';
  scale: {
    min: number;
    max: number;
    labels: {
      min: string;
      max: string;
    };
  };
}

export interface IOpenEndedQuestion extends IBaseQuestion {
  type: 'open-ended';
  maxLength?: number;
  scoringRubric?: IScoringRubric;
}

export type IQuestion = 
  | IMultipleChoiceQuestion
  | ITextQuestion
  | IVideoQuestion
  | IForcedChoiceQuestion
  | ILikertQuestion
  | IOpenEndedQuestion;

export interface IQuestionCreate {
  type: QuestionType;
  content: string;
  section: Types.ObjectId;
  order: number;
  options?: string[];
  correctOption?: number;
  maxLength?: number;
  maxDuration?: number;
  scoringRubric?: IScoringRubric;
  scale?: {
    min: number;
    max: number;
    labels: {
      min: string;
      max: string;
    };
  };
} 