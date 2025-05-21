import { Body, Controller, Post } from '@nestjs/common';
import { AllowAny, NoCache } from 'src/auth/auth.decorator';
import { RequestOtpDto, VerifyOtpDto } from './dto/otp.dto';
import { OtpService } from './services/otp.service';

@NoCache()
@Controller('otp')
export class OtpController {
  constructor(private readonly otpService: OtpService) {}

  @AllowAny()
  @Post('/request')
  async requestOTP(@Body() payload: RequestOtpDto) {
    return await this.otpService.sendOTP(payload);
  }

  @AllowAny()
  @Post('/verify')
  async verifyOTP(@Body() payload: VerifyOtpDto) {
    return await this.otpService.verifyOTP(payload);
  }
}
