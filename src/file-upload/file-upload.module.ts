import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { FileUploadService } from 'src/file-upload/file-upload.service';
import { FileUploadController } from './file-upload.controller';
import {
  FileUploadMetaData,
  FileUploadMetaDataSchema,
} from './file-upload.schema';

@Module({
  imports: [
    HttpModule,
    MongooseModule.forFeature([
      { name: FileUploadMetaData.name, schema: FileUploadMetaDataSchema },
    ]),
  ],
  controllers: [FileUploadController],
  providers: [FileUploadService],
  exports: [FileUploadService],
})
export class FileUploadModule {}
