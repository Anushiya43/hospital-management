import { Controller, Get, Req, UseGuards, Post, Body } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from '../services/auth.service';
import { SendEmailOtpDto } from '../dto/send-email-otp.dto';
import { VerifyEmailOtpDto } from '../dto/verify-email-otp.dto';
import {
  GoogleDoctorGuard,
  GooglePatientGuard,
} from '../guards/google-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('google/patient')
  @UseGuards(GooglePatientGuard)
  async googlePatientLogin(): Promise<any> {
    return { message: 'Google Patient Login' };
  }

  @Get('google/doctor')
  @UseGuards(GoogleDoctorGuard)
  async googleDoctorLogin(): Promise<any> {
    return { message: 'Google Doctor Login' };
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req: any) {
    console.log('GOOGLE USER:', req.user);

    return this.authService.googleLogin(req.user);
  }

  @Post('email/send-otp')
  sendOtp(@Body() dto: SendEmailOtpDto) {
    return this.authService.sendEmailOtp(dto.email);
  }

  @Post('email/verify-otp')
  verifyOtp(@Body() dto: VerifyEmailOtpDto) {
    return this.authService.verifyEmailOtp(dto.email, dto.otp);
  }
}
