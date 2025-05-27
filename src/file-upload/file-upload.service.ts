/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Injectable,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { FastifyReply, FastifyRequest } from 'fastify';
import * as FormData from 'form-data';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FileUploadMetaData } from './file-upload.schema';
import { MothrboxService } from 'src/common/service/mothrbox.service';

@Injectable()
export class FileUploadService {
  constructor(
    @InjectModel(FileUploadMetaData.name)
    private readonly fileUploadMetaDataModel: Model<FileUploadMetaData>,
    private readonly httpService: HttpService,
    private readonly mothrboxService: MothrboxService,
  ) {}

  async crypt(
    operation: 'encrypt' | 'decrypt',
    req: FastifyRequest,
    reply: FastifyReply,
    file: Express.Multer.File,
    userId: string,
    alias: string,
  ) {
    try {
      const cryptedBuffer = await this.mothrboxService.proxyBinaryCall(
        operation,
        userId,
        alias,
        file.buffer,
      );

      reply
        .header('Content-Type', 'application/octet-stream')
        .header(
          'content-disposition',
          `attachment; filename="${file.filename}"`,
        )
        .send(cryptedBuffer);
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
}
