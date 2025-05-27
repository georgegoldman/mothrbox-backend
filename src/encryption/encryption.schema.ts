import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { User, UserDocument } from 'src/users/user.shemas';

export type EncryptedFileMetaDataDocument = EncryptedFileMetaData & Document;

@Schema({ timestamps: true })
export class EncryptedFileMetaData {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: User.name,
  })
  userId: UserDocument;

  @Prop({ required: true })
  originalFilename: string;

  @Prop({ required: true })
  mimeType: string;

  @Prop({ required: true })
  fileSize: number;

  @Prop({ default: 'AES' })
  encryptionType: string;

  @Prop({ default: 'SUCCESSFUL' })
  status: string;
}

export const EncryptedFileMetaDataSchema = SchemaFactory.createForClass(EncryptedFileMetaData);
