import { Response } from 'express';
import { TestSession } from '../models/TestSession';
import { Types } from 'mongoose';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export const createSession = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { candidateId, startDate, endDate, status } = req.body;

    // Check if candidate already has an active session
    const existingSession = await TestSession.findOne({
      candidateId,
      status: { $in: ['pending', 'in_progress'] },
    });

    if (existingSession) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'ACTIVE_SESSION_EXISTS',
          message: 'Candidate already has an active test session',
        },
      });
    }

    // Create new session
    const session = await TestSession.create({
      candidateId,
      startDate,
      endDate,
      status: status || 'pending',
      currentDay: 1,
      currentSection: 'welcome',
      progress: {
        day1: {
          foundationalKnowledge: false,
          timedNegotiation: false,
          ethicalDilemmas: false,
          completed: false,
        },
        day2: {
          scenarioBasedCases: false,
          videoResponses: false,
          ethicalDilemmasWritten: false,
          behavioralHonestyCheck: false,
          completed: false,
        },
      },
    });

    return res.status(201).json({
      success: true,
      data: {
        session,
      },
    });
  } catch (error) {
    console.error('Create session error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred while creating the test session',
      },
    });
  }
};

export const getSessions = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status, candidateId, page = 1, limit = 10 } = req.query;
    const query: any = {};

    if (status) query.status = status;
    if (candidateId) query.candidateId = candidateId;

    const sessions = await TestSession.find(query)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const total = await TestSession.countDocuments(query);

    return res.status(200).json({
      success: true,
      data: {
        sessions,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error) {
    console.error('Get sessions error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred while fetching test sessions',
      },
    });
  }
};

export const getSessionById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const sessionId = new Types.ObjectId(req.params.sessionId);
    const session = await TestSession.findById(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'SESSION_NOT_FOUND',
          message: 'Test session not found',
        },
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        session,
      },
    });
  } catch (error) {
    console.error('Get session error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred while fetching test session data',
      },
    });
  }
};

export const updateSession = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const sessionId = new Types.ObjectId(req.params.sessionId);
    const { status, currentDay, currentSection, progress } = req.body;

    // Check if session exists
    const session = await TestSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'SESSION_NOT_FOUND',
          message: 'Test session not found',
        },
      });
    }

    // Update session fields
    if (status) session.status = status;
    if (currentDay) session.currentDay = currentDay;
    if (currentSection) session.currentSection = currentSection;
    if (progress) session.progress = progress;

    await session.save();

    return res.status(200).json({
      success: true,
      data: {
        session,
      },
    });
  } catch (error) {
    console.error('Update session error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred while updating the test session',
      },
    });
  }
};

export const getCandidateSessions = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const candidateId = new Types.ObjectId(req.params.candidateId);
    const sessions = await TestSession.find({ candidateId }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: {
        sessions,
      },
    });
  } catch (error) {
    console.error('Get candidate sessions error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred while fetching candidate test sessions',
      },
    });
  }
}; 