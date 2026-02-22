import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private resend: Resend;
  private readonly logger = new Logger(MailService.name);

  constructor(private configService: ConfigService) {
    this.resend = new Resend(this.configService.get<string>('RESEND_API_KEY'));
  }

  async sendOtp(email: string, otp: string) {
    const from = this.configService.get<string>('MAIL_FROM') || 'onboarding@resend.dev';

    try {
      const { data, error } = await this.resend.emails.send({
        from: from,
        to: email,
        subject: 'Your Verification Code',
        text: `Your OTP is: ${otp}. It will expire in 10 minutes.`,
        html: `<b>Your OTP is: ${otp}</b><p>It will expire in 10 minutes.</p>`,
      });

      if (error) {
        this.logger.error(`Resend error sending email to ${email}:`, error);
        throw error;
      }

      this.logger.log(`Email sent successfully: ${data?.id}`);
      return data;
    } catch (error) {
      this.logger.error(`Error sending email to ${email}:`, error.message);
      throw error;
    }
  }
}
