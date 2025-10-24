import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
  api_key: process.env.CLOUDINARY_API_KEY || '',
  api_secret: process.env.CLOUDINARY_API_SECRET || '',
});

export interface UploadResult {
  url: string;
  publicId: string;
  secureUrl: string;
}

export async function uploadToCloudinary(
  base64Data: string,
  folder: string = 'fitness-app'
): Promise<UploadResult> {
  try {
    const result = await cloudinary.uploader.upload(base64Data, {
      folder,
      resource_type: 'auto',
      transformation: [
        { quality: 'auto', fetch_format: 'auto' },
      ],
    });

    console.log('[Cloudinary] Uploaded:', result.public_id);

    return {
      url: result.url,
      publicId: result.public_id,
      secureUrl: result.secure_url,
    };
  } catch (error) {
    console.error('[Cloudinary] Upload error:', error);
    throw new Error('Failed to upload to Cloudinary');
  }
}

export async function deleteFromCloudinary(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId);
    console.log('[Cloudinary] Deleted:', publicId);
  } catch (error) {
    console.error('[Cloudinary] Delete error:', error);
    throw new Error('Failed to delete from Cloudinary');
  }
}

export async function uploadVideoToCloudinary(
  base64Data: string,
  folder: string = 'fitness-app/videos'
): Promise<UploadResult> {
  try {
    const result = await cloudinary.uploader.upload(base64Data, {
      folder,
      resource_type: 'video',
      transformation: [
        { quality: 'auto', fetch_format: 'auto' },
      ],
    });

    console.log('[Cloudinary] Uploaded video:', result.public_id);

    return {
      url: result.url,
      publicId: result.public_id,
      secureUrl: result.secure_url,
    };
  } catch (error) {
    console.error('[Cloudinary] Video upload error:', error);
    throw new Error('Failed to upload video to Cloudinary');
  }
}
