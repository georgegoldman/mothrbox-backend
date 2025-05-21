import { Global, Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailController } from './mail.controller';
import { MailerModule } from '@nestjs-modules/mailer';
import { MailProcessor } from './mail.processor';
import {
  SMTP_HOST,
  SMTP_USER,
  SMTP_PASSWORD,
  APP_NAME,
  SMTP_EMAIL,
  SMTP_PORT,
} from 'src/config/utils/src/util.constants';

@Global()
@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: SMTP_HOST,
        port: +SMTP_PORT || 465,
        secure: true,
        auth: {
          user: SMTP_USER,
          pass: SMTP_PASSWORD,
        },
      },
      defaults: {
        from: `${APP_NAME} <${SMTP_EMAIL}>`,
      },
    }),
  ],
  controllers: [MailController],
  providers: [MailService, MailProcessor],
  exports: [MailService],
})
export class MailModule {}
