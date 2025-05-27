import {
  Controller,
  Param,
  Post,
  Req,
  Res,
  UploadedFile,
  UseInterceptors,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { EncryptionService } from './encryption.service';
import { FastifyReply, FastifyRequest } from 'fastify';
import { AllowAny } from '../auth/auth.decorator';
import { FileInterceptor } from '@nest-lab/fastify-multer';

@Controller('encrypt')
export class EncryptionController {
  constructor(private encryptionService: EncryptionService) {}

  @AllowAny()
  @Post('/:userId/upload')
  @UseInterceptors(FileInterceptor('file'))
  async encrypt(
    @Req() req: FastifyRequest,
    @Res() reply: FastifyReply,
    @UploadedFile() file: Express.Multer.File,
    @Param('userId') userId: string,
  ): Promise<void> {
    try {
      console.log('Upload endpoint hit');
      console.log('Content-Type:', req.headers['content-type']);
      console.log('Request method:', req.method);
      console.log('File received:', file ? 'Yes' : 'No');

      if (file) {
        console.log('File details:', {
          originalname: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
        });
      }

      return await this.encryptionService.encrypt(req, reply, file, userId);
    } catch (error) {
      console.error('Controller error:', error);
      throw new HttpException(
        `Upload failed: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
