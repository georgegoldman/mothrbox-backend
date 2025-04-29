import { Controller, Post, Body, Delete, Query, Get } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { LoggedInUserDecorator } from 'src/auth/auth.decorator';
import { UserDocument } from 'src/users/user.shemas';

@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Post()
  async createWallet(@LoggedInUserDecorator() user: UserDocument) {
    return await this.walletService.createWallet(user);
  }

  @Get()
  async getUserWallets(@LoggedInUserDecorator() user: UserDocument) {
    return await this.walletService.getUserWallets(user);
  }

  @Delete(':walletId')
  async removeWallet(
    @LoggedInUserDecorator() user: UserDocument,
    @Query('walletId') walletId: string,
  ) {
    await this.walletService.deleteWallet(user, walletId);
    return { success: true };
  }
}
