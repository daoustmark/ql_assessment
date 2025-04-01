import { Question } from '../models/Question';
import { Response } from '../models/Response';
import { QuestionType, IQuestion } from '../../types/question.types';
import { IResponse, IMultipleChoiceResponse, ITextResponse, IForcedChoiceResponse, ILikertResponse } from '../../types/response.types';

export class ScoringService {
  static async gradeResponse(responseId: string): Promise<{
    score: number;
    maxScore: number;
    feedback?: string;
  }> {
    const response = await Response.findById(responseId).populate('question');
    if (!response || !response.question) {
      throw new Error('Response or question not found');
    }

    const question = response.question as unknown as IQuestion;
    const { type } = question;

    switch (type) {
      case 'multiple-choice': {
        const mcResponse = response as unknown as IMultipleChoiceResponse;
        return this.gradeMultipleChoice(
          mcResponse.value,
          question.correctOption
        );
      }
      case 'text': {
        const textResponse = response as unknown as ITextResponse;
        return this.gradeTextResponse(
          textResponse.value,
          question.scoringRubric?.criteria || ''
        );
      }
      case 'forced-choice': {
        const fcResponse = response as unknown as IForcedChoiceResponse;
        return this.gradeForcedChoice(
          fcResponse.value,
          question.scoringRubric?.criteria || ''
        );
      }
      case 'likert': {
        const likertResponse = response as unknown as ILikertResponse;
        return this.gradeLikertScale(
          likertResponse.value,
          question.scale.max
        );
      }
      default:
        throw new Error('Unsupported question type');
    }
  }

  private static gradeMultipleChoice(
    answer: number,
    correctAnswer: number
  ): { score: number; maxScore: number } {
    return {
      score: answer === correctAnswer ? 1 : 0,
      maxScore: 1,
    };
  }

  private static gradeTextResponse(
    answer: string,
    criteria: string
  ): { score: number; maxScore: number; feedback?: string } {
    // Simple keyword matching for text responses
    const answerKeywords = answer.toLowerCase().split(/\s+/);
    const correctKeywords = criteria.toLowerCase().split(/\s+/);
    const matchedKeywords = answerKeywords.filter((keyword) =>
      correctKeywords.includes(keyword)
    );

    const score = matchedKeywords.length / correctKeywords.length;
    const maxScore = 1;

    return {
      score,
      maxScore,
      feedback: score >= 0.7
        ? 'Good answer! You covered most of the key points.'
        : 'Consider reviewing the key concepts and providing more detailed answers.',
    };
  }

  private static gradeForcedChoice(
    answer: number,
    criteria: string
  ): { score: number; maxScore: number } {
    // For forced choice, we'll use the criteria as a reference point
    const score = answer > 0 ? 1 : 0;
    return {
      score,
      maxScore: 1,
    };
  }

  private static gradeLikertScale(
    answer: number,
    maxValue: number
  ): { score: number; maxScore: number } {
    // Calculate score based on how close the answer is to the maximum value
    const score = answer / maxValue;
    return {
      score,
      maxScore: 1,
    };
  }

  static async calculateSessionScore(sessionId: string): Promise<{
    totalScore: number;
    maxScore: number;
    percentage: number;
    sectionScores: Record<string, { score: number; maxScore: number }>;
  }> {
    const responses = await Response.find({ session: sessionId }).populate('question');
    const sectionScores: Record<string, { score: number; maxScore: number }> = {};

    let totalScore = 0;
    let maxScore = 0;

    for (const response of responses) {
      const question = response.question as unknown as IQuestion;
      const { score, maxScore: questionMaxScore } = await this.gradeResponse(
        response._id.toString()
      );

      totalScore += score;
      maxScore += questionMaxScore;

      // Track section scores
      const section = question.section.toString();
      if (!sectionScores[section]) {
        sectionScores[section] = { score: 0, maxScore: 0 };
      }
      sectionScores[section].score += score;
      sectionScores[section].maxScore += questionMaxScore;
    }

    return {
      totalScore,
      maxScore,
      percentage: (totalScore / maxScore) * 100,
      sectionScores,
    };
  }
} 