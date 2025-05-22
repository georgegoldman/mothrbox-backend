import { Injectable } from '@nestjs/common';
import { MailService } from '../../mail/mail.service';
import { OtpTypeEnum } from 'src/common/enums';
import { IRequestOtp } from 'src/common/interface';
import { OtpEmailTemplate } from 'src/mail/templates/generic-otp.email';
import { VerifyEmailTemplate } from 'src/mail/templates/verify-email.email';

@Injectable()
export class OtpMailService {
  constructor(private readonly mailService: MailService) {}

  async sendOtpMail(payload: IRequestOtp) {
    switch (payload.type) {
      case OtpTypeEnum.VERIFY_EMAIL:
        return await this.sendVerifyEmail(payload);
      case OtpTypeEnum.RESET_PASSWORD:
        return await this.sendGenericOtp(payload);
    }
  }

  async sendVerifyEmail(payload: IRequestOtp) {
    const { code } = payload;

    await this.mailService.sendEmail(
      payload.email,
      'Verify your email',
      VerifyEmailTemplate({
        code: code!,
      }),
    );
  }
  async sendGenericOtp(payload: IRequestOtp) {
    const { code } = payload;

    await this.mailService.sendEmail(
      payload.email,
      'Your OTP Code',
      OtpEmailTemplate(code!),
    );
  }
}
