import { Response } from 'express';
import { Response as ResponseModel } from '../models/Response';
import { Question } from '../models/Question';
import { TestSession } from '../models/TestSession';
import { Types } from 'mongoose';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export const submitResponse = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { sessionId, questionId, answer, videoUrl } = req.body;
    const userId = req.user?.userId;

    // Validate session exists and user has access
    const session = await TestSession.findOne({
      _id: new Types.ObjectId(sessionId),
      candidateId: userId,
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'SESSION_NOT_FOUND',
          message: 'Test session not found or access denied',
        },
      });
    }

    // Validate question exists
    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'QUESTION_NOT_FOUND',
          message: 'Question not found',
        },
      });
    }

    // Create response based on question type
    const response = await ResponseModel.create({
      sessionId: new Types.ObjectId(sessionId),
      questionId: new Types.ObjectId(questionId),
      candidateId: userId,
      type: question.type,
      answer,
      videoUrl,
      submittedAt: new Date(),
    });

    return res.status(201).json({
      success: true,
      data: {
        response,
      },
    });
  } catch (error) {
    console.error('Submit response error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred while submitting the response',
      },
    });
  }
};

export const getResponses = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { sessionId, questionId, type, page = 1, limit = 10 } = req.query;
    const query: any = {};

    if (sessionId) query.sessionId = new Types.ObjectId(sessionId as string);
    if (questionId) query.questionId = new Types.ObjectId(questionId as string);
    if (type) query.type = type;

    const responses = await ResponseModel.find(query)
      .sort({ submittedAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const total = await ResponseModel.countDocuments(query);

    return res.status(200).json({
      success: true,
      data: {
        responses,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error) {
    console.error('Get responses error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred while fetching responses',
      },
    });
  }
};

export const getResponseById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const responseId = new Types.ObjectId(req.params.responseId);
    const response = await ResponseModel.findById(responseId);

    if (!response) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'RESPONSE_NOT_FOUND',
          message: 'Response not found',
        },
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        response,
      },
    });
  } catch (error) {
    console.error('Get response error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred while fetching response data',
      },
    });
  }
};

export const getSessionResponses = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const sessionId = new Types.ObjectId(req.params.sessionId);
    const userId = req.user?.userId;

    // Validate session exists and user has access
    const session = await TestSession.findOne({
      _id: sessionId,
      candidateId: userId,
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'SESSION_NOT_FOUND',
          message: 'Test session not found or access denied',
        },
      });
    }

    const responses = await ResponseModel.find({ sessionId })
      .sort({ submittedAt: -1 });

    return res.status(200).json({
      success: true,
      data: {
        responses,
      },
    });
  } catch (error) {
    console.error('Get session responses error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred while fetching session responses',
      },
    });
  }
};

export const getCandidateResponses = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const candidateId = new Types.ObjectId(req.params.candidateId);
    const userId = req.user?.userId;

    // Only allow admins to view other candidates' responses
    if (candidateId.toString() !== userId?.toString() && req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Access denied',
        },
      });
    }

    const responses = await ResponseModel.find({ candidateId })
      .sort({ submittedAt: -1 });

    return res.status(200).json({
      success: true,
      data: {
        responses,
      },
    });
  } catch (error) {
    console.error('Get candidate responses error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred while fetching candidate responses',
      },
    });
  }
}; 