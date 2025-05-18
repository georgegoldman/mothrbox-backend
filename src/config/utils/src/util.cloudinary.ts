import { Readable } from 'stream';
import * as streamifier from 'streamifier';
import { NotFoundError, ValidationError, ForbiddenError } from './util.errors';
import { DeleteApiResponse, v2 as cloudinary, v2 } from 'cloudinary';
import * as dotenv from 'dotenv';
import {
  CLOUDINARY_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
} from './util.constants';

dotenv.config();
const CLOUDINARY = 'Cloudinary';
export const Cloudinary = {
  provide: CLOUDINARY,
  useFactory: () => {
    return v2.config({
      cloud_name: CLOUDINARY_NAME,
      api_key: CLOUDINARY_API_KEY,
      api_secret: CLOUDINARY_API_SECRET,
    });
  },
};

interface File {
  buffer: Buffer;
  stream: Readable;
  mimetype: string;
  originalname: string;
  size: number;
  fieldname: string;
  encoding: string;
  destination: string;
  filename: string;
  path: string;
}

export interface CloudinaryResponse {
  public_id: string;
  secure_url: string;
  http_code?: number;
  [key: string]: any;
}

export class CloudinaryUtil {
  static async uploadFile(file: File): Promise<CloudinaryResponse> {
    if (!file || !file.buffer) {
      throw new NotFoundError('Invalid file: Buffer is missing');
    }

    return new Promise<CloudinaryResponse>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'mothrbox' },
        (error, result) => {
          if (error) return reject(new Error(error.message));
          if (!result) return reject(new Error('Upload failed - no result'));
          resolve(result as CloudinaryResponse);
        },
      );

      // Use the provided stream or create one from the buffer
      if (file.stream) {
        file.stream.pipe(uploadStream);
      } else {
        streamifier.createReadStream(file.buffer).pipe(uploadStream);
      }
    });
  }

  static async deleteFile(fileUrl: string): Promise<DeleteApiResponse> {
    if (!fileUrl) {
      throw new ForbiddenError('File URL is required for deletion');
    }

    try {
      const publicId = this.extractPublicIdFromUrl(fileUrl);

      return await cloudinary.uploader.destroy(publicId, {
        invalidate: true,
      });
    } catch (error) {
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  private static extractPublicIdFromUrl(url: string): string {
    try {
      const urlParts = url.split('/');

      const versionIndex = urlParts.findIndex(
        (part) => part.startsWith('v') && /^v\d+$/.test(part),
      );

      if (versionIndex !== -1 && versionIndex < urlParts.length - 1) {
        return urlParts
          .slice(versionIndex + 1)
          .join('/')
          .replace(/\.\w+$/, '');
      }

      throw new Error('Invalid Cloudinary URL format');
    } catch (error) {
      throw new ValidationError(
        `Failed to extract public ID: ${error.message}`,
      );
    }
  }
}
