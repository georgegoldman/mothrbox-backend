import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { KeyEnum } from 'src/common/enums';
import { User, UserDocument } from 'src/users/user.shemas';

export type KeyDocument = HydratedDocument<Key>;

@Schema({ timestamps: true })
export class Key {
  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: User.name,
  })
  User: UserDocument;

  @Prop({ enum: KeyEnum, default: null })
  type: KeyEnum;

  @Prop({ required: true })
  value: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const KeySchema = SchemaFactory.createForClass(Key);
