import { Response } from 'express';
import { Question } from '../models/Question';
import { Types } from 'mongoose';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export const createQuestion = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { type, text, options, correctAnswer, explanation, category, difficulty } = req.body;

    // Create new question based on type
    const question = await Question.create({
      type,
      text,
      options,
      correctAnswer,
      explanation,
      category,
      difficulty,
    });

    return res.status(201).json({
      success: true,
      data: {
        question,
      },
    });
  } catch (error) {
    console.error('Create question error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred while creating the question',
      },
    });
  }
};

export const getQuestions = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { type, category, difficulty, page = 1, limit = 10 } = req.query;
    const query: any = {};

    if (type) query.type = type;
    if (category) query.category = category;
    if (difficulty) query.difficulty = difficulty;

    const questions = await Question.find(query)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const total = await Question.countDocuments(query);

    return res.status(200).json({
      success: true,
      data: {
        questions,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error) {
    console.error('Get questions error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred while fetching questions',
      },
    });
  }
};

export const getQuestionById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const questionId = new Types.ObjectId(req.params.questionId);
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

    return res.status(200).json({
      success: true,
      data: {
        question,
      },
    });
  } catch (error) {
    console.error('Get question error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred while fetching question data',
      },
    });
  }
};

export const updateQuestion = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const questionId = new Types.ObjectId(req.params.questionId);
    const { text, options, correctAnswer, explanation, category, difficulty } = req.body;

    // Check if question exists
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

    // Update question fields
    if (text) question.text = text;
    if (options) question.options = options;
    if (correctAnswer) question.correctAnswer = correctAnswer;
    if (explanation) question.explanation = explanation;
    if (category) question.category = category;
    if (difficulty) question.difficulty = difficulty;

    await question.save();

    return res.status(200).json({
      success: true,
      data: {
        question,
      },
    });
  } catch (error) {
    console.error('Update question error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred while updating the question',
      },
    });
  }
};

export const deleteQuestion = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const questionId = new Types.ObjectId(req.params.questionId);

    // Check if question exists
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

    await question.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Question deleted successfully',
    });
  } catch (error) {
    console.error('Delete question error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred while deleting the question',
      },
    });
  }
};

export const getQuestionsByCategory = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { category } = req.params;
    const { type, difficulty, page = 1, limit = 10 } = req.query;
    const query: any = { category };

    if (type) query.type = type;
    if (difficulty) query.difficulty = difficulty;

    const questions = await Question.find(query)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const total = await Question.countDocuments(query);

    return res.status(200).json({
      success: true,
      data: {
        questions,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error) {
    console.error('Get questions by category error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred while fetching questions by category',
      },
    });
  }
}; 