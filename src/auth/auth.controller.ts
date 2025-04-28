/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserDto } from 'src/common/dtos';
import { AllowAny, NoCache } from './auth.decorator';

@NoCache()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @AllowAny()
  @Post('register')
  async register(@Body() payload: UserDto) {
    return await this.authService.register(payload);
  }

  @AllowAny()
  @Post('login')
  async login(@Body() payload: UserDto) {
    return await this.authService.login(payload);
  }
}
