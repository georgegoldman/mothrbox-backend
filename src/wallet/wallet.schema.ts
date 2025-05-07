import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from 'src/users/user.shemas';

export type WalletDocument = HydratedDocument<Wallet>;

@Schema({ timestamps: true })
export class Wallet {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name })
  user: User;

  @Prop({ required: true, unique: true })
  walletAddress: string;

  @Prop({ required: true })
  mnemonic: string;

  @Prop({ default: false })
  isDeleted: boolean;
}

export const WalletSchema = SchemaFactory.createForClass(Wallet);

WalletSchema.pre(['find', 'findOne'], function (next) {
  this.where({ isDeleted: false });
  next();
});
