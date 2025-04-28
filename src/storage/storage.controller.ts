/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Controller, Post, Body } from '@nestjs/common';
import { UploadFileDto } from '../common/dtos';
import { EncryptionService } from '../encryption/encryption.service';
import { StorageService } from './storage.service';
import { v4 as uuidv4 } from 'uuid';

@Controller('files')
export class StorageController {
  constructor(
    private readonly encryptionService: EncryptionService,
    private readonly storageService: StorageService,
  ) {}

  @Post('upload')
  async uploadFile(@Body() uploadFileDto: UploadFileDto) {
    const fileId = uuidv4();
    const encrypted = await this.encryptionService.encryptFile(uploadFileDto);

    const metadata = {
      ...uploadFileDto.metadata,
      fileId,
      userId: uploadFileDto.userId,
      ephemeralPublicKey: encrypted.ephemeralPublicKey,
      timestamp: new Date().toISOString(),
    };

    const storageUrl = this.storageService.storeFile(
      fileId,
      encrypted.encryptedData,
    );

    return {
      fileId,
      storageUrl,
      ephemeralPublicKey: encrypted.ephemeralPublicKey,
    };
  }
}
