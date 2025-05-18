import { Controller, Post, Body, Req } from '@nestjs/common';
import { StorageService } from './storage.service';
import { UploadFileDto } from 'src/common/dtos';
import { UserDocument } from 'src/users/user.shemas';
import { LoggedInUserDecorator } from '../auth/auth.decorator';
import { FastifyRequest } from 'fastify';
import { NotFoundError } from 'src/config/utils/src/util.errors';

@Controller('files')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Post('upload')
  async handleFileUpload(
    @LoggedInUserDecorator() user: UserDocument,
    @Req() req: FastifyRequest,
    @Body() payload: UploadFileDto,
  ): Promise<any> {
    try {
      const parts = (req as any).parts?.();
      if (!parts) throw new NotFoundError('No files provided');

      return this.storageService.uploadFile(user, parts, payload);
    } catch (error) {
      console.error('File upload error details:', error);
      return {
        success: false,
        message: 'Error processing file upload',
        error: error.message,
      };
    }
  }

  @Post()
  async uploadFile(
    @LoggedInUserDecorator() user: UserDocument,
    @Body() payload: UploadFileDto,
  ) {
    return await this.storageService.handleFileUpload(user, payload);
  }
}
