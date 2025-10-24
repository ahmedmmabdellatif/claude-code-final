import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: process.env.AWS_S3_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET || '';

export interface UploadResult {
  url: string;
  key: string;
}

export async function uploadToS3(
  buffer: Buffer,
  key: string,
  mimeType: string
): Promise<UploadResult> {
  try {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
      ACL: 'public-read',
    });

    await s3Client.send(command);

    const url = `https://${BUCKET_NAME}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${key}`;

    console.log('[S3] Uploaded file:', key);
    return { url, key };
  } catch (error) {
    console.error('[S3] Upload error:', error);
    throw new Error('Failed to upload file to S3');
  }
}

export async function deleteFromS3(key: string): Promise<void> {
  try {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(command);
    console.log('[S3] Deleted file:', key);
  } catch (error) {
    console.error('[S3] Delete error:', error);
    throw new Error('Failed to delete file from S3');
  }
}

export function generateS3Key(userId: string, filename: string): string {
  const timestamp = Date.now();
  const sanitized = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
  return `uploads/${userId}/${timestamp}-${sanitized}`;
}
