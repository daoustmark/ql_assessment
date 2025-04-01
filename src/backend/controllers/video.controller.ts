import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { StorageService } from '../services/storage.service';

export const getUploadUrl = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { fileType } = req.body;

    if (!fileType) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_FILE_TYPE',
          message: 'File type is required',
        },
      });
    }

    const { uploadUrl, key } = await StorageService.generateUploadUrl(fileType);

    return res.status(200).json({
      success: true,
      data: {
        uploadUrl,
        key,
      },
    });
  } catch (error) {
    console.error('Get upload URL error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred while generating upload URL',
      },
    });
  }
};

export const getDownloadUrl = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { key } = req.params;

    if (!key) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_KEY',
          message: 'Video key is required',
        },
      });
    }

    const downloadUrl = await StorageService.generateDownloadUrl(key);

    return res.status(200).json({
      success: true,
      data: {
        downloadUrl,
      },
    });
  } catch (error) {
    console.error('Get download URL error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred while generating download URL',
      },
    });
  }
};

export const deleteVideo = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { key } = req.params;

    if (!key) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_KEY',
          message: 'Video key is required',
        },
      });
    }

    await StorageService.deleteVideo(key);

    return res.status(200).json({
      success: true,
      message: 'Video deleted successfully',
    });
  } catch (error) {
    console.error('Delete video error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred while deleting the video',
      },
    });
  }
};

export const getVideoUrl = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { key } = req.params;

    if (!key) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_KEY',
          message: 'Video key is required',
        },
      });
    }

    const videoUrl = StorageService.getVideoUrl(key);

    return res.status(200).json({
      success: true,
      data: {
        videoUrl,
      },
    });
  } catch (error) {
    console.error('Get video URL error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred while getting the video URL',
      },
    });
  }
}; 