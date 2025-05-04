import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { KeysEnum } from 'src/common/enums';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop({ unique: true, index: true })
  email: string;

  @Prop({ select: false })
  password: string;

  @Prop({ unique: true, sparse: true })
  walletAddress: string;

  @Prop()
  walletNonce: string;

  @Prop({ required: false, default: null, index: true })
  username: string;

  @Prop({ unique: true, index: true })
  phone: string;

  @Prop({ required: false, default: null })
  profilePhoto: string;

  @Prop({ enum: KeysEnum, default: null })
  keys: KeysEnum;
}

export const UserSchema = SchemaFactory.createForClass(User);
