import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { StorageController } from './storage.controller';
import { StorageService } from './storage.service';
import { EncryptionModule } from 'src/encryption/encryption.module';
import { Cloudinary } from 'src/config/utils/src/util.cloudinary';

@Module({
  imports: [HttpModule, EncryptionModule, MongooseModule.forFeature()],
  controllers: [StorageController],
  providers: [StorageService, Cloudinary],
  exports: [StorageService],
})
export class StorageModule {}
