import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { UploadFileDto } from 'src/common/dtos';
import { EncryptionService } from './encryption.service';
import { LoggedInUserDecorator } from 'src/auth/auth.decorator';
import { UserDocument } from 'src/users/user.shemas';

@Controller('encrypt')
export class EncryptionController {
  constructor(private encryptionService: EncryptionService) {}

  @Post()
  async encryptFile(
    @LoggedInUserDecorator() user: UserDocument,
    @Body() payload: UploadFileDto,
  ) {
    return this.encryptionService.encryptFile(user, payload);
  }

  @Get(':fileId')
  async getEncryptedFileById(@Param('fileId') fileId: string) {
    return this.encryptionService.getEncryptedFileById(fileId);
  }
}
