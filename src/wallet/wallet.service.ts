import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Wallet, WalletDocument } from './wallet.schema';
import { UserDocument } from 'src/users/user.shemas';
import {
  generateWallet,
  generateSecret,
} from 'src/config/utils/src/util.encrypt';

@Injectable()
export class WalletService {
  constructor(@InjectModel(Wallet.name) private walletModel: Model<Wallet>) {}

  async createWallet(user: UserDocument) {
    try {
      const wallet = generateWallet();
      const nonce = generateSecret();
      const userWallet = await this.walletModel.create({
        walletAddress: wallet.walletAddress,
        privateKey: wallet.privateKey,
        mnemonic: wallet.mnemonic,
        user: user._id,
      });
      return {
        userWallet,
        nonce,
      };
    } catch (error) {
      console.error('An error occurred while creating wallet:', error);
      throw new InternalServerErrorException(error);
    }
  }

  async findByAddress(walletAddress: string): Promise<WalletDocument | null> {
    return this.walletModel.findOne({ walletAddress }).exec();
  }

  async getUserWallets(user: UserDocument): Promise<WalletDocument[]> {
    return this.walletModel.find({ user: user._id }).exec();
  }

  async deleteWallet(user: UserDocument, walletId: string): Promise<void> {
    await this.walletModel.findOneAndUpdate(
      {
        user: user._id,
        _id: { $ne: walletId },
      },
      { isDeleted: true },
    );
  }
}
