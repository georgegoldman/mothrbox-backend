import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { StorageController } from './storage.controller';
import { StorageService } from './storage.service';
import { EncryptionModule } from 'src/encryption/encryption.module';
import { StorageSchema, Storage } from './storage.schema';
import { MultipartFile } from '@fastify/multipart';

declare module 'fastify' {
  interface FastifyRequest {
    files?: () => AsyncIterableIterator<MultipartFile>;
  }
}
@Module({
  imports: [
    HttpModule,
    EncryptionModule,
    MongooseModule.forFeature([{ name: Storage.name, schema: StorageSchema }]),
  ],
  controllers: [StorageController],
  providers: [StorageService],
  exports: [StorageService],
})
export class StorageModule {}
