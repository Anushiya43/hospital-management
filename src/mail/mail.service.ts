import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  async sendOtp(email: string, otp: string) {
    // later: nodemailer / SES / SendGrid
    console.log(`Sending OTP ${otp} to ${email}`);
  }
}
