import { IQuestion } from '../types/question.types';
import { IResponse } from '../types/response.types';

export interface ScoreResult {
  score: number;
  maxScore: number;
  percentage: number;
  feedback?: string;
}

export interface SectionScore {
  score: number;
  maxScore: number;
  percentage: number;
  questionCount: number;
}

export interface TestScore {
  totalScore: number;
  maxScore: number;
  percentage: number;
  sectionScores: Record<string, SectionScore>;
}

export function calculateQuestionScore(
  question: IQuestion,
  response: IResponse
): ScoreResult {
  const { type } = question;

  switch (type) {
    case 'multiple-choice': {
      const mcResponse = response as { value: number };
      const score = mcResponse.value === question.correctOption ? 1 : 0;
      return {
        score,
        maxScore: 1,
        percentage: score * 100,
      };
    }
    case 'text': {
      const textResponse = response as { value: string };
      const criteria = question.scoringRubric?.criteria || '';
      const score = calculateTextScore(textResponse.value, criteria);
      return {
        score,
        maxScore: 1,
        percentage: score * 100,
        feedback: generateTextFeedback(score),
      };
    }
    case 'forced-choice': {
      const fcResponse = response as { value: number };
      const score = fcResponse.value > 0 ? 1 : 0;
      return {
        score,
        maxScore: 1,
        percentage: score * 100,
      };
    }
    case 'likert': {
      const likertResponse = response as { value: number };
      const score = likertResponse.value / question.scale.max;
      return {
        score,
        maxScore: 1,
        percentage: score * 100,
      };
    }
    default:
      return {
        score: 0,
        maxScore: 1,
        percentage: 0,
      };
  }
}

function calculateTextScore(answer: string, criteria: string): number {
  const answerKeywords = answer.toLowerCase().split(/\s+/);
  const correctKeywords = criteria.toLowerCase().split(/\s+/);
  const matchedKeywords = answerKeywords.filter((keyword) =>
    correctKeywords.includes(keyword)
  );
  return matchedKeywords.length / correctKeywords.length;
}

function generateTextFeedback(score: number): string {
  if (score >= 0.7) {
    return 'Good answer! You covered most of the key points.';
  }
  if (score >= 0.4) {
    return 'Your answer is partially correct. Consider adding more details and key concepts.';
  }
  return 'Consider reviewing the key concepts and providing more detailed answers.';
}

export function calculateSectionScore(
  questions: IQuestion[],
  responses: IResponse[]
): SectionScore {
  let totalScore = 0;
  let maxScore = 0;

  for (const question of questions) {
    const response = responses.find((r) => r.question.toString() === question._id.toString());
    if (response) {
      const { score, maxScore: questionMaxScore } = calculateQuestionScore(
        question,
        response
      );
      totalScore += score;
      maxScore += questionMaxScore;
    }
  }

  return {
    score: totalScore,
    maxScore,
    percentage: (totalScore / maxScore) * 100,
    questionCount: questions.length,
  };
}

export function calculateTestScore(
  questions: IQuestion[],
  responses: IResponse[]
): TestScore {
  const sectionScores: Record<string, SectionScore> = {};
  let totalScore = 0;
  let maxScore = 0;

  // Group questions by section
  const questionsBySection = questions.reduce((acc, question) => {
    const section = question.section.toString();
    if (!acc[section]) {
      acc[section] = [];
    }
    acc[section].push(question);
    return acc;
  }, {} as Record<string, IQuestion[]>);

  // Calculate scores for each section
  for (const [section, sectionQuestions] of Object.entries(questionsBySection)) {
    const sectionResponses = responses.filter((response) =>
      sectionQuestions.some((q) => q._id.toString() === response.question.toString())
    );

    const sectionScore = calculateSectionScore(sectionQuestions, sectionResponses);
    sectionScores[section] = sectionScore;

    totalScore += sectionScore.score;
    maxScore += sectionScore.maxScore;
  }

  return {
    totalScore,
    maxScore,
    percentage: (totalScore / maxScore) * 100,
    sectionScores,
  };
} 