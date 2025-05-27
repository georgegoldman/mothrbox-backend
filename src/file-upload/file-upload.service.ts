import {
  Injectable,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { FastifyReply, FastifyRequest } from 'fastify';
import * as FormData from 'form-data';
import { MOTHRBOX_BASE_URL } from 'src/config/utils/src/util.constants';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FileUploadMetaData } from './file-upload.schema';

@Injectable()
export class FileUploadService {
  constructor(
    @InjectModel(FileUploadMetaData.name)
    private readonly fileUploadMetaDataModel: Model<FileUploadMetaData>,
    private readonly httpService: HttpService,
  ) {}

  async encrypt(
    req: FastifyRequest,
    reply: FastifyReply,
    file: Express.Multer.File,
    userId: string,
    alias: string,
  ) {
    try {
      if (!file?.buffer) {
        return reply
          .status(400)
          .send({ message: 'No file or buffer provided' });
      }

      const formData = new FormData();
      formData.append('file', file.buffer, file.originalname);

      const mothrboxUrl = MOTHRBOX_BASE_URL;
      if (!mothrboxUrl) {
        throw new InternalServerErrorException('Service configuration error');
      }

      const targetUrl = `${mothrboxUrl}/encrypt/${userId}/${alias}`;

      const response = await this.httpService.axiosRef.post(
        targetUrl,
        formData,
        {
          responseType: 'arraybuffer',
          headers: {
            Accept: 'application/msgpack',
            ...formData.getHeaders(),
          },
          timeout: 30000,
        },
      );

      const encryptedBuffer = Buffer.from(response.data);
      const encryptedFilename = `${file.originalname}.enc`;

      const metadata = await this.fileUploadMetaDataModel.create({
        userId,
        fileName: encryptedFilename,
        mimeType: file.mimetype,
        fileSize: file.size,
      });

      reply
        .header('Content-Type', 'application/octet-stream')
        .header(
          'Content-Disposition',
          `attachment; filename="${encryptedFilename}"`,
        )
        .header('Content-Length', encryptedBuffer.length.toString())
        .header(
          'X-File-Metadata',
          JSON.stringify({
            _id: metadata._id,
            userId: metadata.userId,
            mimeType: metadata.mimeType,
          }),
        )
        .header('Cache-Control', 'no-cache, no-store, must-revalidate')
        .header('Pragma', 'no-cache')
        .header('Expires', '0');

      return reply.send(encryptedBuffer);
    } catch (error) {
      console.error('Encryption error:', error);

      if (error.response?.status === 404) {
        throw new BadRequestException('Encryption service not found');
      }

      throw new InternalServerErrorException('Failed to encrypt file');
    }
  }

  async decrypt(
    req: FastifyRequest,
    reply: FastifyReply,
    file: Express.Multer.File,
    userId: string,
    alias: string,
  ) {
    try {
      console.log('=== DECRYPTION DEBUG INFO ===');
      console.log('MOTHRBOX_BASE_URL:', MOTHRBOX_BASE_URL);
      console.log('User ID:', userId);
      console.log('Alias:', alias);
      console.log('File info:', {
        originalname: file?.originalname,
        size: file?.size,
        mimetype: file?.mimetype,
        hasBuffer: !!file?.buffer,
        bufferSize: file?.buffer?.length,
      });

      if (!file || !file.buffer) {
        return reply
          .status(400)
          .send({ message: 'No file or file buffer provided' });
      }

      if (!file.originalname.endsWith('.enc')) {
        return reply
          .status(400)
          .send({ message: 'Encrypted file with .enc extension is required' });
      }

      if (!MOTHRBOX_BASE_URL) {
        console.error('MOTHRBOX_BASE_URL is not configured');
        throw new InternalServerErrorException(
          'Service configuration error: MOTHRBOX_BASE_URL not set',
        );
      }

      const formData = new FormData();
      formData.append('file', file.buffer, file.originalname);
      const targetUrl = `${MOTHRBOX_BASE_URL}/decrypt/${userId}/${alias}`;

      console.log('Target URL:', targetUrl);
      console.log('Form data headers:', formData.getHeaders());

      const response = await this.httpService.axiosRef.post(
        targetUrl,
        formData,
        {
          responseType: 'arraybuffer',
          headers: {
            Accept: 'application/msgpack',
            ...formData.getHeaders(),
          },
          timeout: 30000,
        },
      );

      console.log('Decryption response status:', response.status);
      console.log('Decryption response headers:', response.headers);

      const decryptedBuffer = Buffer.from(response.data);
      const decryptedFilename = file.originalname.replace(/\.enc$/, '');

      console.log('Decrypted buffer size:', decryptedBuffer.length);
      console.log('Decrypted filename:', decryptedFilename);

      reply
        .header(
          'Content-Type',
          response.headers['content-type'] || 'application/octet-stream',
        )
        .header('Content-Length', decryptedBuffer.length.toString())
        .header(
          'Content-Disposition',
          `attachment; filename="${decryptedFilename}"`,
        );

      return reply.send(decryptedBuffer);
    } catch (error) {
      console.error('=== DECRYPTION ERROR DETAILS ===');
      console.error('Error type:', error.constructor.name);
      console.error('Error message:', error?.message);
      console.error('Error code:', error?.code);

      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response statusText:', error.response.statusText);
        console.error('Response headers:', error.response.headers);
        console.error('Response data:', error.response.data);

        // Try to parse response data if it's a buffer
        if (error.response.data instanceof Buffer) {
          try {
            const errorText = error.response.data.toString('utf8');
            console.error('Response data as text:', errorText);
          } catch (parseError) {
            console.error('Could not parse response data as text');
          }
        }
      }

      if (error.request) {
        console.error('Request config:', {
          url: error.request.url || error.config?.url,
          method: error.request.method || error.config?.method,
          headers: error.config?.headers,
        });
      }

      console.error('Full error object:', error);

      // Provide more specific error messages based on the error type
      if (error.response?.status === 400) {
        throw new BadRequestException(
          `Decryption failed: Invalid request - ${error.response.data || 'Bad request'}`,
        );
      } else if (error.response?.status === 404) {
        throw new BadRequestException('Decryption service endpoint not found');
      } else if (error.response?.status === 500) {
        throw new InternalServerErrorException(
          `External service error: ${error.response.data || 'Internal server error'}`,
        );
      } else if (error.code === 'ECONNREFUSED') {
        throw new InternalServerErrorException(
          'Cannot connect to decryption service',
        );
      } else if (error.code === 'ETIMEDOUT') {
        throw new InternalServerErrorException('Decryption service timeout');
      }

      throw new InternalServerErrorException(
        `Failed to decrypt file: ${error.message}`,
      );
    }
  }
  // async getUserEncryptedFiles(
  //   userId: string,
  //   query: PaginatedQuery,
  // ): Promise<PaginatedDoc<EncryptedFileMetaData>> {
  //   try {
  //     // Use the pagination utility with user filter
  //     const result = await paginate(this.encryptedFileMetadataModel, query, {
  //       page: query.page || 1,
  //       limit: query.limit || 10,
  //       sortField: query.sortField,
  //       sortOrder: query.sortOrder as 'asc' | 'desc' | undefined,
  //       fiterQuery: {
  //         userId,
  //       },
  //     });

  //     return result;
  //   } catch (error) {
  //     console.error('Error fetching user encrypted files:', error);

  //     if (error instanceof BadRequestException) {
  //       throw error;
  //     }

  //     throw new InternalServerErrorException('Failed to fetch encrypted files');
  //   }
  // }
}
