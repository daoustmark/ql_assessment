import { TestSession } from '../models/TestSession';
import { ApiError } from '../utils/ApiError';
import { prisma } from '../utils/prisma';

export class TestSessionService {
  async createSession(testId: string, userId: string): Promise<TestSession> {
    const test = await prisma.test.findUnique({
      where: { id: testId },
      include: { questions: true },
    });

    if (!test) {
      throw new ApiError('Test not found', 404);
    }

    const session = await prisma.testSession.create({
      data: {
        testId,
        userId,
        status: 'IN_PROGRESS',
        startTime: new Date(),
        answers: {},
      },
    });

    return session;
  }

  async getSession(sessionId: string): Promise<TestSession> {
    const session = await prisma.testSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new ApiError('Test session not found', 404);
    }

    return session;
  }

  async updateSession(sessionId: string, updates: Partial<TestSession>): Promise<TestSession> {
    const session = await prisma.testSession.update({
      where: { id: sessionId },
      data: updates,
    });

    return session;
  }

  async submitAnswer(sessionId: string, questionId: string, answer: any): Promise<TestSession> {
    const session = await this.getSession(sessionId);

    if (session.status !== 'IN_PROGRESS') {
      throw new ApiError('Cannot submit answer to completed session', 400);
    }

    const updatedAnswers = {
      ...session.answers,
      [questionId]: answer,
    };

    return this.updateSession(sessionId, { answers: updatedAnswers });
  }

  async completeSession(sessionId: string): Promise<TestSession> {
    const session = await this.getSession(sessionId);

    if (session.status !== 'IN_PROGRESS') {
      throw new ApiError('Session is already completed', 400);
    }

    return this.updateSession(sessionId, {
      status: 'COMPLETED',
      endTime: new Date(),
    });
  }

  async getSessionResults(sessionId: string): Promise<any> {
    const session = await prisma.testSession.findUnique({
      where: { id: sessionId },
      include: {
        test: {
          include: {
            questions: true,
          },
        },
      },
    });

    if (!session) {
      throw new ApiError('Test session not found', 404);
    }

    if (session.status !== 'COMPLETED') {
      throw new ApiError('Session is not completed', 400);
    }

    // Calculate results based on question types and answers
    const results = {
      totalQuestions: session.test.questions.length,
      answeredQuestions: Object.keys(session.answers).length,
      score: 0,
      answers: session.answers,
      startTime: session.startTime,
      endTime: session.endTime,
      duration: session.endTime ? 
        (session.endTime.getTime() - session.startTime.getTime()) / 1000 : 
        null,
    };

    return results;
  }
} 