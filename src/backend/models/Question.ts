import { Schema, model, Types } from 'mongoose';
import { 
  IQuestion, 
  QuestionType, 
  IMultipleChoiceQuestion,
  ITextQuestion,
  IVideoQuestion,
  IForcedChoiceQuestion,
  ILikertQuestion,
  IOpenEndedQuestion
} from '../../types/question.types';

const scoringRubricSchema = new Schema({
  criteria: {
    type: String,
    required: true,
  },
  levels: [{
    score: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
  }],
});

const baseQuestionSchema = new Schema({
  type: {
    type: String,
    enum: ['multiple-choice', 'text', 'video', 'forced-choice', 'likert', 'open-ended'],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  section: {
    type: Schema.Types.ObjectId,
    ref: 'Section',
    required: true,
  },
  order: {
    type: Number,
    required: true,
  },
}, {
  timestamps: true,
  discriminatorKey: 'type',
});

// Multiple Choice Question Schema
const multipleChoiceSchema = new Schema({
  options: [{
    type: String,
    required: true,
  }],
  correctOption: {
    type: Number,
    required: true,
    min: 0,
  },
});

// Text Question Schema
const textSchema = new Schema({
  maxLength: {
    type: Number,
    min: 1,
  },
  scoringRubric: scoringRubricSchema,
});

// Video Question Schema
const videoSchema = new Schema({
  maxDuration: {
    type: Number,
    min: 1,
  },
  scoringRubric: scoringRubricSchema,
});

// Forced Choice Question Schema
const forcedChoiceSchema = new Schema({
  options: [{
    type: String,
    required: true,
  }],
  scoringRubric: scoringRubricSchema,
});

// Likert Question Schema
const likertSchema = new Schema({
  scale: {
    min: {
      type: Number,
      required: true,
    },
    max: {
      type: Number,
      required: true,
    },
    labels: {
      min: {
        type: String,
        required: true,
      },
      max: {
        type: String,
        required: true,
      },
    },
  },
});

// Open Ended Question Schema
const openEndedSchema = new Schema({
  maxLength: {
    type: Number,
    min: 1,
  },
  scoringRubric: scoringRubricSchema,
});

// Create the Question model with discriminators
const Question = model<IQuestion>('Question', baseQuestionSchema);

// Add discriminators for each question type
Question.discriminator<IMultipleChoiceQuestion>('multiple-choice', multipleChoiceSchema);
Question.discriminator<ITextQuestion>('text', textSchema);
Question.discriminator<IVideoQuestion>('video', videoSchema);
Question.discriminator<IForcedChoiceQuestion>('forced-choice', forcedChoiceSchema);
Question.discriminator<ILikertQuestion>('likert', likertSchema);
Question.discriminator<IOpenEndedQuestion>('open-ended', openEndedSchema);

// Indexes for efficient queries
Question.collection.createIndex({ section: 1, order: 1 });
Question.collection.createIndex({ type: 1 });

export { Question }; 