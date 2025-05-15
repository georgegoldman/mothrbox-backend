import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { EncryptionService } from 'src/encryption/encryption.service';
import { EncryptionController } from './encryption.controller';

@Module({
  imports: [HttpModule, MongooseModule.forFeature()],
  controllers: [EncryptionController],
  providers: [EncryptionService],
  exports: [EncryptionService],
})
export class EncryptionModule {}
