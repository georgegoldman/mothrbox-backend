import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer/dist';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendEmail(
    toEmail: string,
    subject: string,
    template: string,
    attachments?: {
      filename: string;
      path: string;
      contentType?: string;
    }[],
  ) {
    try {
      await this.mailerService.sendMail({
        to: toEmail,
        subject,
        html: template,
        attachments: [...(attachments || [])],
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error sending email:', error.message);
      } else {
        console.error('Error sending email:', error);
      }
    }
  }
}
