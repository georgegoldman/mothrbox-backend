import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';
import { KeyEnum } from 'src/common/enums';
import { User } from 'src/users/user.shemas';
import { string } from 'zod';

export type KeyDocument = HydratedDocument<Key>;

@Schema({ timestamps: true })
export class Key {
  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: User.name,
  })
  User: Types.ObjectId;

  @Prop({
    type: string,
    enum: Object.values(KeyEnum),
    required: true,
  })
  type: KeyEnum;

  @Prop({ required: true })
  privateKey: string;

  @Prop({ required: true })
  publicKey: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: 'AES' })
  algorithm: string;
}

export const KeySchema = SchemaFactory.createForClass(Key);
