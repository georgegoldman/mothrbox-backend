/* eslint-disable no-useless-catch */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
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
  Get,
} from '@nestjs/common';
import { FileUploadService } from './file-upload.service';
import { FastifyReply, FastifyRequest } from 'fastify';
import { LoggedInUserDecorator } from '../auth/auth.decorator';
import { FileInterceptor } from '@nest-lab/fastify-multer';
import { UserDocument } from 'src/users/user.schema';
import { MothrboxService } from 'src/common/service/mothrbox.service';

@Controller('file-upload')
export class FileUploadController {
  constructor(
    private fileCryptoService: FileUploadService,
    private mothrboxService: MothrboxService,
  ) {}

  @Post('/:operation')
  @UseInterceptors(FileInterceptor('file'))
  async encrypt(
    @Param('operation') operation: 'encrypt' | 'decrypt',
    @Req() req: FastifyRequest,
    @Res() reply: FastifyReply,
    @UploadedFile() file: Express.Multer.File,
    @LoggedInUserDecorator() user: UserDocument,
    @Body('alias') alias: string,
    @Body('owner') owner: string,
  ): Promise<void> {
    try {
      if (file) {
        console.log('File details:', {
          originalname: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
        });
      }

      console.log(operation);

      return await this.fileCryptoService.crypt(
        operation,
        req,
        reply,
        file,
        user._id.toString(),
        alias,
        owner,
        file.originalname,
      );
    } catch (error) {
      console.error('Controller error:', error);
      throw new HttpException(
        `Upload failed: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('decrypt/:userId/:alias/:blobId')
  async decryptFile(
    @Param('userId') userId: string,
    @Param('alias') alias: string,
    @Param('blobId') blobId: string,
    @Res() res: FastifyReply,
  ) {
    try {
      const buffer = await this.mothrboxService.proxyFetchAndDecrypt(
        userId,
        alias,
        blobId,
      );

      // Option 1: Return as binary stream
      return res
        .header('Content-Type', 'application/octet-stream')
        .header(
          'Content-Disposition',
          `attachment; filename="decrypted_${blobId}"`,
        )
        .send(buffer);

      // Option 2: Decode MsgPack and return JSON
      // const decoded = decode(buffer);
      // return res.header('Content-Type', 'application/json').send(decoded);
    } catch (error) {
      throw error;
    }
  }
}
