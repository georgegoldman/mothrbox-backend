import { Controller, Post, Body, Get, Param, Req } from '@nestjs/common';
import { UploadFileDto } from '../common/dtos';
import { StorageService } from './storage.service';
import { LoggedInUserDecorator } from 'src/auth/auth.decorator';
import { UserDocument } from 'src/users/user.shemas';
import { FastifyRequest } from 'fastify';

@Controller('files')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Post('upload')
  async handleFileUpload(
    @Req() req: FastifyRequest,
    @LoggedInUserDecorator() user: UserDocument,
    @Body() payload: UploadFileDto,
  ) {
    if (!req.files) {
      return { message: 'Multipart not configured correctly.' };
    }

    return this.storageService.uploadFile(req.files(), user, payload);
  }

  @Get(':fileId')
  async getFileById(@Param('fileId') fileId: string) {
    return await this.storageService.getFileById(fileId);
  }

  @Post()
  async uploadFile(
    @LoggedInUserDecorator() user: UserDocument,
    @Body() payload: UploadFileDto,
  ) {
    return await this.storageService.handleFileUpload(user, payload);
  }
}
