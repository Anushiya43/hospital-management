import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(MailService.name);

  constructor(private configService: ConfigService) {
    const port = Number(this.configService.get<number>('MAIL_PORT'));
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('MAIL_HOST'),
      port: port,
      secure: port === 465, // true for 465, false for other ports
      auth: {
        user: this.configService.get<string>('MAIL_USER'),
        pass: this.configService.get<string>('MAIL_PASS'),
      },
      // Timeout settings for better reliability on cloud platforms
      connectionTimeout: 10000, // 10 seconds
      greetingTimeout: 10000,
      socketTimeout: 10000,
      // Force IPv4 to avoid ENETUNREACH issues with IPv6 on some cloud networks
      family: 4,
    } as any);
  }

  async sendOtp(email: string, otp: string) {
    const mailOptions = {
      from: this.configService.get<string>('MAIL_FROM'),
      to: email,
      subject: 'Your Verification Code',
      text: `Your OTP is: ${otp}. It will expire in 10 minutes.`,
      html: `<b>Your OTP is: ${otp}</b><p>It will expire in 10 minutes.</p>`,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email sent: ${info.messageId}`);
      return info;
    } catch (error) {
      this.logger.error(`Error sending email to ${email}:`, error.stack);
      throw error;
    }
  }
}
