import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HttpModule } from '@nestjs/axios';
import { StorageController } from './storage/storage.controller';
import { EncryptionService } from './encryption/encryption.service';
import { StorageService } from './storage/storage.service';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [HttpModule, MongooseModule.forRoot('mongodb://localhost/nest')],
  controllers: [AppController, StorageController],
  providers: [AppService, EncryptionService, StorageService],
})
export class AppModule {}
