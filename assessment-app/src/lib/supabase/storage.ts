import { createClient } from '@/lib/supabase/client';

// Storage bucket for video uploads
export const VIDEO_BUCKET = 'video_responses';

/**
 * Upload a video file to Supabase Storage
 * @param file The video file to upload
 * @param userId The user ID
 * @param attemptId The assessment attempt ID
 * @param questionId The question ID
 * @returns The path of the uploaded file or null if upload failed
 */
export async function uploadVideo(
  file: File,
  userId: string,
  attemptId: string | number,
  questionId: string | number
): Promise<string | null> {
  try {
    const supabase = createClient();
    
    // Generate a unique filename based on user ID, attempt ID, and question ID
    const filename = `${userId}_${attemptId}_${questionId}_${Date.now()}.webm`;
    const filePath = `${userId}/${filename}`;
    
    const { data, error } = await supabase.storage
      .from(VIDEO_BUCKET)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });
    
    if (error) {
      console.error('Error uploading video:', error.message);
      return null;
    }
    
    return data?.path || null;
  } catch (error: any) {
    console.error('Exception uploading video:', error.message);
    return null;
  }
}

/**
 * Get the public URL for a video file
 * @param path The path of the video file
 * @returns The public URL of the video file or null if path is invalid
 */
export function getVideoUrl(path: string): string | null {
  try {
    const supabase = createClient();
    const { data } = supabase.storage
      .from(VIDEO_BUCKET)
      .getPublicUrl(path);
    
    return data?.publicUrl || null;
  } catch (error: any) {
    console.error('Exception getting video URL:', error.message);
    return null;
  }
}

/**
 * Delete a video file from Supabase Storage
 * @param path The path of the video file to delete
 * @returns True if deletion was successful, false otherwise
 */
export async function deleteVideo(path: string): Promise<boolean> {
  try {
    const supabase = createClient();
    const { error } = await supabase.storage
      .from(VIDEO_BUCKET)
      .remove([path]);
    
    if (error) {
      console.error('Error deleting video:', error.message);
      return false;
    }
    
    return true;
  } catch (error: any) {
    console.error('Exception deleting video:', error.message);
    return false;
  }
} 