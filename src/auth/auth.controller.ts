/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AllowAny, NoCache } from './auth.decorator';
import { CreateUserDto, LoginDto, WalletLoginDto } from 'src/common/dtos';

@NoCache()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @AllowAny()
  @Post('register')
  async register(@Body() payload: CreateUserDto) {
    return await this.authService.register(payload);
  }

  @AllowAny()
  @Post('login')
  async login(@Body() payload: LoginDto) {
    return await this.authService.login(payload);
  }

  @Get('wallet-nonce/:walletAddress')
  getWalletNonce(@Param('walletAddress') walletAddress: string) {
    return this.authService.generateWalletAuthNonce(walletAddress);
  }

  @Post('wallet-login')
  async walletLogin(@Body() payload: WalletLoginDto) {
    return this.authService.loginWithWallet(payload);
  }
}
