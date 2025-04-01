import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET || 'quiet-light-videos';

export class StorageService {
  static async generateUploadUrl(fileType: string): Promise<{ uploadUrl: string; key: string }> {
    const key = `videos/${uuidv4()}.${fileType}`;
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      ContentType: `video/${fileType}`,
    });

    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

    return {
      uploadUrl,
      key,
    };
  }

  static async generateDownloadUrl(key: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    return getSignedUrl(s3Client, command, { expiresIn: 3600 });
  }

  static async deleteVideo(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(command);
  }

  static getVideoUrl(key: string): string {
    return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`;
  }
} 