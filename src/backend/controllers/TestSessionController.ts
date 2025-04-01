import { Request, Response } from 'express';
import { TestSessionService } from '../services/TestSessionService';
import { TestSession } from '../models/TestSession';
import { ApiError } from '../utils/ApiError';

export class TestSessionController {
  private testSessionService: TestSessionService;

  constructor() {
    this.testSessionService = new TestSessionService();
  }

  async createSession(req: Request, res: Response): Promise<void> {
    try {
      const { testId, userId } = req.body;
      const session = await this.testSessionService.createSession(testId, userId);
      res.status(201).json(session);
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to create test session' });
      }
    }
  }

  async getSession(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      const session = await this.testSessionService.getSession(sessionId);
      res.json(session);
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to get test session' });
      }
    }
  }

  async updateSession(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      const updates = req.body;
      const session = await this.testSessionService.updateSession(sessionId, updates);
      res.json(session);
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to update test session' });
      }
    }
  }

  async submitAnswer(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      const { questionId, answer } = req.body;
      const session = await this.testSessionService.submitAnswer(sessionId, questionId, answer);
      res.json(session);
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to submit answer' });
      }
    }
  }

  async completeSession(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      const session = await this.testSessionService.completeSession(sessionId);
      res.json(session);
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to complete test session' });
      }
    }
  }

  async getSessionResults(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      const results = await this.testSessionService.getSessionResults(sessionId);
      res.json(results);
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to get session results' });
      }
    }
  }
} 