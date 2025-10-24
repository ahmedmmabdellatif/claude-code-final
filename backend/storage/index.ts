export interface StorageUploadResult {
  url: string;
  key: string;
}

export interface StorageAdapter {
  upload(data: string, filename: string, mimeType: string): Promise<StorageUploadResult>;
  delete(key: string): Promise<void>;
}

class MockStorageAdapter implements StorageAdapter {
  private mockUrl = 'https://mock-storage.example.com';

  async upload(data: string, filename: string, mimeType: string): Promise<StorageUploadResult> {
    const key = `mock-${Date.now()}-${filename}`;
    const url = `${this.mockUrl}/${key}`;
    
    console.log('[MockStorage] Mock upload:', { filename, mimeType, size: data.length });
    
    return { url, key };
  }

  async delete(key: string): Promise<void> {
    console.log('[MockStorage] Mock delete:', key);
  }
}

class CloudinaryAdapter implements StorageAdapter {
  async upload(base64Data: string, filename: string, mimeType: string): Promise<StorageUploadResult> {
    try {
      const { uploadToCloudinary, uploadVideoToCloudinary } = await import('./cloudinary');
      
      const isVideo = mimeType.startsWith('video/');
      const result = isVideo 
        ? await uploadVideoToCloudinary(base64Data)
        : await uploadToCloudinary(base64Data);

      return {
        url: result.secureUrl,
        key: result.publicId,
      };
    } catch (error) {
      console.error('[CloudinaryAdapter] Error:', error);
      throw new Error('Cloudinary upload failed');
    }
  }

  async delete(publicId: string): Promise<void> {
    try {
      const { deleteFromCloudinary } = await import('./cloudinary');
      await deleteFromCloudinary(publicId);
    } catch (error) {
      console.error('[CloudinaryAdapter] Delete error:', error);
      throw new Error('Cloudinary delete failed');
    }
  }
}

class S3Adapter implements StorageAdapter {
  async upload(base64Data: string, filename: string, mimeType: string): Promise<StorageUploadResult> {
    try {
      const { uploadToS3, generateS3Key } = await import('./s3');
      
      const base64Cleaned = base64Data.replace(/^data:[^;]+;base64,/, '');
      const buffer = Buffer.from(base64Cleaned, 'base64');
      
      const userId = 'system';
      const key = generateS3Key(userId, filename);
      
      const result = await uploadToS3(buffer, key, mimeType);
      
      return {
        url: result.url,
        key: result.key,
      };
    } catch (error) {
      console.error('[S3Adapter] Error:', error);
      throw new Error('S3 upload failed');
    }
  }

  async delete(key: string): Promise<void> {
    try {
      const { deleteFromS3 } = await import('./s3');
      await deleteFromS3(key);
    } catch (error) {
      console.error('[S3Adapter] Delete error:', error);
      throw new Error('S3 delete failed');
    }
  }
}

function createStorageAdapter(): StorageAdapter {
  const provider = process.env.STORAGE_PROVIDER || 'mock';

  switch (provider) {
    case 'cloudinary':
      if (!process.env.CLOUDINARY_CLOUD_NAME) {
        console.warn('[Storage] Cloudinary credentials missing, using mock storage');
        return new MockStorageAdapter();
      }
      return new CloudinaryAdapter();

    case 's3':
      if (!process.env.AWS_S3_BUCKET) {
        console.warn('[Storage] AWS S3 credentials missing, using mock storage');
        return new MockStorageAdapter();
      }
      return new S3Adapter();

    default:
      console.log('[Storage] Using mock storage (set STORAGE_PROVIDER env variable)');
      return new MockStorageAdapter();
  }
}

export const storage = createStorageAdapter();

export async function uploadFile(
  base64Data: string,
  filename: string,
  mimeType: string
): Promise<StorageUploadResult> {
  return storage.upload(base64Data, filename, mimeType);
}

export async function deleteFile(key: string): Promise<void> {
  return storage.delete(key);
}
