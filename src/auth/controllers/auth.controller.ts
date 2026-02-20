import { Controller, Get, Req, UseGuards, Post, Body, UnauthorizedException, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from '../services/auth.service';
import { SendEmailOtpDto } from '../dto/send-email-otp.dto';
import { VerifyEmailOtpDto } from '../dto/verify-email-otp.dto';
import {
  GoogleDoctorGuard,
  GooglePatientGuard,
} from '../guards/google-auth.guard';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.gurd';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

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
  async googleCallback(@Req() req: any, @Res() res: any) {
    console.log('GOOGLE USER:', req.user);

    const result = await this.authService.googleLogin(req.user);

    // Construct redirect URL
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const redirectUrl = `${frontendUrl}/auth/callback?token=${result.access_token}`;

    return res.redirect(redirectUrl);
  }

  @Post('email/send-otp')
  sendOtp(@Body() dto: SendEmailOtpDto) {
    return this.authService.sendEmailOtp(dto.email);
  }

  @Post('email/verify-otp')
  verifyOtp(@Body() dto: VerifyEmailOtpDto) {
    return this.authService.verifyEmailOtp(dto.email, dto.otp);
  }

  @Post('register')
  register(@Body() dto: RegisterDto) {

    return this.authService.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  //logout
  @Get("logout")
  @UseGuards(JwtAuthGuard)
  async logout(@Req() req: Request) {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
      throw new UnauthorizedException('Token not found');
    }
    const token = authHeader.replace('Bearer ', '');
    return this.authService.logout(token);
  }
}
