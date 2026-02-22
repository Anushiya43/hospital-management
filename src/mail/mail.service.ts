import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sgMail from '@sendgrid/mail';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private configService: ConfigService) {
    sgMail.setApiKey(this.configService.get<string>('SENDGRID_API_KEY') || '');
  }

  async sendOtp(email: string, otp: string) {
    const from = this.configService.get<string>('MAIL_FROM') || 'anushiyavcse04@gmail.com';

    const msg = {
      to: email,
      from: from,
      subject: 'Your Verification Code',
      text: `Your OTP is: ${otp}. It will expire in 10 minutes.`,
      html: `<b>Your OTP is: ${otp}</b><p>It will expire in 10 minutes.</p>`,
    };

    try {
      await sgMail.send(msg);
      this.logger.log(`Email sent successfully to ${email}`);
      return { success: true };
    } catch (error) {
      this.logger.error(`Error sending email to ${email}:`, error.message);
      if (error.response) {
        this.logger.error(error.response.body);
      }
      throw error;
    }
  }
}
