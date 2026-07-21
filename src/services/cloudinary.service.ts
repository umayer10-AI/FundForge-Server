import { v2 as cloudinary } from 'cloudinary';
import { config } from '../config';
import { logger } from '../utils/logger';

cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
});

export const cloudinaryService = {
  async uploadImage(file: Express.Multer.File): Promise<string | null> {
    try {
      const base64 = file.buffer.toString('base64');
      const dataUri = `data:${file.mimetype};base64,${base64}`;

      const result = await cloudinary.uploader.upload(dataUri, {
        folder: 'fundforge',
        resource_type: 'image',
        transformation: [{ quality: 'auto', fetch_format: 'auto' }],
      });

      return result.secure_url;
    } catch (error) {
      logger.error('Cloudinary upload error:', error);
      return null;
    }
  },

  async uploadFromUrl(url: string): Promise<string | null> {
    try {
      const result = await cloudinary.uploader.upload(url, {
        folder: 'fundforge',
        resource_type: 'image',
        transformation: [{ quality: 'auto', fetch_format: 'auto' }],
      });
      return result.secure_url;
    } catch (error) {
      logger.error('Cloudinary upload from URL error:', error);
      return null;
    }
  },

  async deleteImage(publicId: string): Promise<boolean> {
    try {
      await cloudinary.uploader.destroy(publicId);
      return true;
    } catch (error) {
      logger.error('Cloudinary delete error:', error);
      return false;
    }
  },
};
