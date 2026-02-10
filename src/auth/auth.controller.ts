import { Controller, Get, Param, Patch, Post, Query, Req, UseGuards ,Body, UnauthorizedException} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { UserRole } from 'src/generated/prisma/enums';
import { JwtAuthGuard } from './guard/jwtAuth.guard';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RolesGuard } from './guard/roles.guard';
import { Roles } from './roles.decorator'; 
import { SendEmailOtpDto } from './dto/send-email-otp.dto';
import { VerifyEmailOtpDto } from './dto/verify-email-otp.dto';


@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req) {
    console.log('GOOGLE USER:', req.user);
    return this.authService.googleLogin(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('roleChange/:id')
  async updateRole(@Param('id') id : string , @Query('role') role : UserRole){
    return this.authService.updateRole(+id,role)
  }

      // Email + password
    @Post('register')
    register(@Body() dto: RegisterDto) {
      console.log("8888888888888")
    return this.authService.register(dto);
    }

    @Post('email/send-otp')
    sendOtp(@Body() dto: SendEmailOtpDto) {
    return this.authService.sendEmailOtp(dto.email);
  }

   @Post('email/verify-otp')
   verifyOtp(@Body() dto: VerifyEmailOtpDto) {
    return this.authService.verifyEmailOtp(dto.email, dto.otp);
  }

    @Post('login')
    login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
    }

      //logout
    @UseGuards(JwtAuthGuard)
    async logout(@Req() req: Request) {
      const authHeader = req.headers['authorization'];

      if (!authHeader) {
        throw new UnauthorizedException('Token not found');
      }

      const token = authHeader.replace('Bearer ', '');

      return this.authService.logout(token);
    }

    @Get()
    @Roles(UserRole.DOCTOR)
    findAll(){
      return this.authService.findAll()
    }

}
