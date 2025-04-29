import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop({ required: true, unique: true, index: true })
  email: string;

  @Prop()
  password: string;

  @Prop({ unique: true, sparse: true })
  walletAddress: string;

  @Prop()
  walletNonce: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
