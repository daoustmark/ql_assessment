import { Schema, model, Types } from 'mongoose';
import { 
  IResponse,
  IMultipleChoiceResponse,
  ITextResponse,
  IVideoResponse,
  IForcedChoiceResponse,
  ILikertResponse,
  IOpenEndedResponse
} from '../../types/response.types';

const baseResponseSchema = new Schema({
  type: {
    type: String,
    enum: ['multiple-choice', 'text', 'video', 'forced-choice', 'likert', 'open-ended'],
    required: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  question: {
    type: Schema.Types.ObjectId,
    ref: 'Question',
    required: true,
  },
  session: {
    type: Schema.Types.ObjectId,
    ref: 'TestSession',
    required: true,
  },
  section: {
    type: Schema.Types.ObjectId,
    ref: 'Section',
    required: true,
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
  discriminatorKey: 'type',
});

// Multiple Choice Response Schema
const multipleChoiceSchema = new Schema({
  value: {
    type: Number,
    required: true,
    min: 0,
  },
  isCorrect: {
    type: Boolean,
  },
});

// Text Response Schema
const textSchema = new Schema({
  value: {
    type: String,
    required: true,
  },
  score: {
    type: Number,
    min: 0,
  },
  scoringNotes: {
    type: String,
  },
});

// Video Response Schema
const videoSchema = new Schema({
  videoUrl: {
    type: String,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
    min: 0,
  },
  score: {
    type: Number,
    min: 0,
  },
  scoringNotes: {
    type: String,
  },
});

// Forced Choice Response Schema
const forcedChoiceSchema = new Schema({
  value: {
    type: Number,
    required: true,
    min: 0,
  },
  score: {
    type: Number,
    min: 0,
  },
  scoringNotes: {
    type: String,
  },
});

// Likert Response Schema
const likertSchema = new Schema({
  value: {
    type: Number,
    required: true,
  },
});

// Open Ended Response Schema
const openEndedSchema = new Schema({
  value: {
    type: String,
    required: true,
  },
  score: {
    type: Number,
    min: 0,
  },
  scoringNotes: {
    type: String,
  },
});

// Create the Response model with discriminators
const Response = model<IResponse>('Response', baseResponseSchema);

// Add discriminators for each response type
Response.discriminator<IMultipleChoiceResponse>('multiple-choice', multipleChoiceSchema);
Response.discriminator<ITextResponse>('text', textSchema);
Response.discriminator<IVideoResponse>('video', videoSchema);
Response.discriminator<IForcedChoiceResponse>('forced-choice', forcedChoiceSchema);
Response.discriminator<ILikertResponse>('likert', likertSchema);
Response.discriminator<IOpenEndedResponse>('open-ended', openEndedSchema);

// Indexes for efficient queries
Response.collection.createIndex({ user: 1, session: 1 });
Response.collection.createIndex({ question: 1 });
Response.collection.createIndex({ section: 1 });
Response.collection.createIndex({ submittedAt: 1 });

export { Response }; 