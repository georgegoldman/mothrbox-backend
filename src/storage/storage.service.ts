import { Injectable } from '@nestjs/common';
import { EncryptionService } from '../encryption/encryption.service';
import { v4 as uuidv4 } from 'uuid';
import { HttpService } from '@nestjs/axios';
import { MOTHRBOX_BASE_URL } from 'src/config/utils/src/util.constants';
import { UserDocument } from 'src/users/user.shemas';
import { UploadFileDto } from 'src/common/dtos';
import { MultipartFile } from '@fastify/multipart';
import { NotFoundError } from 'src/config/utils/src/util.errors';
import { CloudinaryUtil } from 'src/config/utils/src/util.cloudinary';
import { Readable } from 'stream';

@Injectable()
export class StorageService {
  constructor(
    private readonly encryptionService: EncryptionService,
    private readonly httpService: HttpService,
  ) {}

  async uploadFile(
    user: UserDocument,
    files: AsyncIterableIterator<MultipartFile>,
    payload: UploadFileDto,
  ) {
    try {
      for await (const file of files) {
        if (file.type === 'file') {
          const buffer = await file.toBuffer();

          // Create a readable stream from the buffer
          const readableStream = new Readable();
          readableStream.push(buffer);
          readableStream.push(null);

          const multerFile: {
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
          } = {
            buffer,
            stream: readableStream,
            mimetype: file.mimetype,
            originalname: file.filename,
            size: buffer.length,
            fieldname: file.fieldname,
            encoding: file.encoding,
            destination: '',
            filename: file.filename,
            path: '',
          };

          const result = await CloudinaryUtil.uploadFile(multerFile);

          return {
            message: 'File uploaded successfully',
            public_id: result.public_id,
            url: result.url,
            format: result.format,
            signature: result.signature,
            resource_type: result.resource_type,
            etag: result.etag,
            created_at: result.created_at,
            userId: user._id,
            ephemeralPublicKey: payload.recipientPublicKey,
          };
        }
      }
      throw new NotFoundError('No file found in upload');
    } catch (error) {
      console.error('Error in uploadFile service:', error);
      throw error;
    }
  }
}
