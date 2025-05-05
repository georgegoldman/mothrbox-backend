import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Key, KeySchema } from './key.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Key.name, schema: KeySchema }])],
  controllers: [],
  providers: [],
  exports: [],
})
export class KeysModule {}
