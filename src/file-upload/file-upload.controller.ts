import {
  Controller,
  Post,
  Req,
  Res,
  UploadedFile,
  UseInterceptors,
  HttpException,
  HttpStatus,
  BadRequestException,
  Body,
} from '@nestjs/common';
import { FileUploadService } from './file-upload.service';
import { FastifyReply, FastifyRequest } from 'fastify';
import { LoggedInUserDecorator } from '../auth/auth.decorator';
import { FileInterceptor } from '@nest-lab/fastify-multer';
import { UserDocument } from 'src/users/user.schema';

@Controller('file-upload')
export class FileUploadController {
  constructor(private fileUploadService: FileUploadService) {}

  @Post('encrypt')
  @UseInterceptors(FileInterceptor('file'))
  async encrypt(
    @Req() req: FastifyRequest,
    @Res() reply: FastifyReply,
    @UploadedFile() file: Express.Multer.File,
    @LoggedInUserDecorator() user: UserDocument,
    @Body('alias') alias: string,
  ): Promise<void> {
    try {
      return await this.fileUploadService.encrypt(
        req,
        reply,
        file,
        user._id.toString(),
        alias,
      );
    } catch (error) {
      console.error('Controller error:', error);
      throw new HttpException(
        `Upload failed: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('decrypt')
  @UseInterceptors(FileInterceptor('file'))
  async decryptFile(
    @LoggedInUserDecorator() user: UserDocument,
    @UploadedFile() file: Express.Multer.File,
    @Body('alias') alias: string,
    @Req() req: FastifyRequest,
    @Res() reply: FastifyReply,
  ) {
    try {
      console.log('Controller decrypt method called');
      console.log('User ID:', user._id);
      console.log('File received:', file ? 'Yes' : 'No');
      console.log('Alias:', alias);

      if (!file) {
        throw new BadRequestException('No encrypted file uploaded');
      }

      if (!alias) {
        throw new BadRequestException('Alias is required for decryption');
      }

      return await this.fileUploadService.decrypt(
        req,
        reply,
        file,
        user._id.toString(),
        alias,
      );
    } catch (error) {
      console.error('Controller decryption error:', error);
      throw error;
    }
  }
}
