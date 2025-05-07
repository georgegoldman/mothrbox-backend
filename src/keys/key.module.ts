import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Key, KeySchema } from './key.schema';
import { KeyController } from './key.controller';
import { KeyService } from './key.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    HttpModule,
    MongooseModule.forFeature([{ name: Key.name, schema: KeySchema }]),
  ],
  controllers: [KeyController],
  providers: [KeyService],
  exports: [KeyService],
})
export class KeysModule {}
