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
import { EncryptedFileMetaData } from './encryption.schema';

@Injectable()
export class EncryptionService {
  constructor(
    @InjectModel(EncryptedFileMetaData.name)
    private readonly encryptedFileMetadataModel: Model<EncryptedFileMetaData>,
    private readonly httpService: HttpService,
  ) {}

  async encrypt(
    req: FastifyRequest,
    reply: FastifyReply,
    file: Express.Multer.File,
    userId: string,
  ) {
    try {
      console.log('Service encrypt method called');
      console.log('File in service:', file ? 'Present' : 'Missing');
      console.log('UserId:', userId);

      if (!file) {
        console.error('No file provided to service');
        return reply.status(400).send({ message: 'No file uploaded' });
      }

      if (!file.buffer) {
        console.error('File buffer is missing');
        return reply.status(400).send({ message: 'File buffer is missing' });
      }

      console.log('Creating FormData...');
      const formData = new FormData();
      formData.append('file', file.buffer, file.originalname);

      const mothrboxUrl = MOTHRBOX_BASE_URL;
      if (!mothrboxUrl) {
        console.error('MOTHRBOX_BASE_URL environment variable is not set');
        throw new InternalServerErrorException('Service configuration error');
      }

      const targetUrl = `${mothrboxUrl}/encrypt/${userId}/mtx`;
      console.log('Sending request to:', targetUrl);

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

      console.log('Response status:', response?.status);

      const encryptedBuffer = Buffer.from(response.data);
      const metadata = await this.encryptedFileMetadataModel.create({
        userId,
        originalFilename: file.originalname,
        mimeType: file.mimetype,
        fileSize: file.size,
      });

      const encryptedFilename = `${file.originalname}.enc`;

      // Set headers for blob download
      reply
        .header('Content-Type', 'application/octet-stream')
        .header('Content-Length', encryptedBuffer.length.toString())
        .header(
          'Content-Disposition',
          `attachment; filename="${encryptedFilename}"`,
        )
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
      console.error('Encryption error details:', {
        message: error.message,
        stack: error.stack,
        response: error.response?.data,
        status: error.response?.status,
      });

      if (error.response?.status === 404) {
        throw new BadRequestException('Encryption service not found');
      }

      throw new InternalServerErrorException('Failed to process file');
    }
  }

  async decrypt(
    req: FastifyRequest,
    reply: FastifyReply,
    file: Express.Multer.File,
    userId: string,
  ) {
    try {
      if (!file || !file.originalname.endsWith('.enc')) {
        return reply
          .status(400)
          .send({ message: 'Encrypted file with .enc extension is required' });
      }

      const formData = new FormData();
      formData.append('file', file.buffer, file.originalname);

      const targetUrl = `${MOTHRBOX_BASE_URL}/decrypt/${userId}/mtx`;
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

      const decryptedBuffer = Buffer.from(response.data);

      const decryptedFilename = file.originalname.replace(/\.enc$/, '');

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
      console.error('Decryption failed:', error?.message || error);
      throw new InternalServerErrorException('Failed to decrypt file');
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
