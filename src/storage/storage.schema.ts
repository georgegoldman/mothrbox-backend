import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { User, UserDocument } from '../users/user.shemas';

export type StorageDocument = Storage & Document;

@Schema({ timestamps: true })
export class Storage {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: User.name,
  })
  user: UserDocument;

  @Prop()
  filename: string;

  @Prop()
  mimetype: string;

  @Prop()
  size: number;

  @Prop()
  content: Buffer;

  @Prop({ type: Object })
  metadata: {
    mimetype: string;
    size: number;
  };

  @Prop()
  ephemeralPublicKey: string;
}

export const StorageSchema = SchemaFactory.createForClass(Storage);
