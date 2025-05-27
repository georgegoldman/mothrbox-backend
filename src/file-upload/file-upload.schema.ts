import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { User, UserDocument } from 'src/users/user.schema';

export type FileUploadMetaDataDocument = FileUploadMetaData & Document;

@Schema({ timestamps: true })
export class FileUploadMetaData {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: User.name,
  })
  userId: UserDocument;

  @Prop({ required: true })
  fileName: string;

  @Prop({ required: true })
  mimeType: string;

  @Prop({ required: true })
  fileSize: number;

  @Prop({ default: 'AES' })
  encryptionType: string;

  @Prop({ default: 'SUCCESSFUL' })
  status: string;
}

export const FileUploadMetaDataSchema =
  SchemaFactory.createForClass(FileUploadMetaData);
