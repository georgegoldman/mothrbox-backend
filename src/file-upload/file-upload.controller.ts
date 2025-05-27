import {
  Controller,
  Post,
  Req,
  Res,
  UploadedFile,
  UseInterceptors,
  HttpException,
  HttpStatus,
  // BadRequestException,
  Body,
  Param,
} from '@nestjs/common';
import { FileUploadService } from './file-upload.service';
import { FastifyReply, FastifyRequest } from 'fastify';
import { LoggedInUserDecorator } from '../auth/auth.decorator';
import { FileInterceptor } from '@nest-lab/fastify-multer';
import { UserDocument } from 'src/users/user.schema';

@Controller('file-upload')
export class FileUploadController {
  constructor(private fileCryptoService: FileUploadService) {}

  @Post('/:operation')
  @UseInterceptors(FileInterceptor('file'))
  async encrypt(
    @Param('operation') operation: 'encrypt' | 'decrypt',
    @Req() req: FastifyRequest,
    @Res() reply: FastifyReply,
    @UploadedFile() file: Express.Multer.File,
    @LoggedInUserDecorator() user: UserDocument,
    @Body('alias') alias: string,
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

      return await this.fileCryptoService.crypt(
        operation,
        req,
        reply,
        file,
        user._id.toString(),
        alias,
      );
    } catch (error) {
      console.error('Controller error:', error);
      throw new HttpException(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        `Upload failed: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
