import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from 'src/generated/prisma/enums';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { MailService } from 'src/mail/mail.service';


@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async googleLogin(googleUser: any) {
    let user = await this.prisma.user.findUnique({
      where: { email: googleUser.email },
    });
    

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email: googleUser.email,
          provider: 'GOOGLE',
          providerId: googleUser.providerId,
          role: googleUser.role || UserRole.PATIENT,
        },
      });
    }
    
    return this.generateToken(user)    
  }

  

  async updateRole(userId : number,role : UserRole ){

    console.log(userId)
    return this.prisma.user.update({
      where : {id : userId,},
      data :{role,}
    })
  }

   // Register (email + password)
  async register(dto: RegisterDto) {

    const u = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (dto.password !== dto.conformPassword) {
        throw new BadRequestException('Passwords do not match');
    }


    if (u) {
      throw new BadRequestException('already created');
    }
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash: hashedPassword,
        role: dto.role ?? 'PATIENT',
        provider: 'LOCAL',
      },
    });

    return user
    
  }

  async sendEmailOtp(email: string) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const otpHash = await bcrypt.hash(otp, 10);

    await this.prisma.emailOtp.create({
      data: {
        email,
        otp : otpHash,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
      },
    });
     await this.mailService.sendOtp(email, otp);

    return { message: 'OTP sent to email' };
  }

   async verifyEmailOtp(email: string, otp: string) {
    const record = await this.prisma.emailOtp.findFirst({
      where: { email },
      orderBy: { createdAt: 'desc' },
    });
    if (!record) throw new UnauthorizedException('OTP not found');
    if (record.expiresAt < new Date()) throw new UnauthorizedException('OTP expired');
    const isValid = await bcrypt.compare(otp, record.otp);
    console.log(isValid)
    if (!isValid) throw new UnauthorizedException('Invalid OTP');
    console.log(record)

    const user = await this.prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        throw new BadRequestException('User not found');
      }

    await this.prisma.user.update({
      where: { email, },
      data: { verified: true },
    });

    return { message: 'Email verified successfully' };
  }

  
   // Login (email + password)
  async login(dto: LoginDto) {
    console.log('.........................................')
    console.log(dto)
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValid = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );

    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateToken(user);
  }
  private generateToken(user: any) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: payload,
    };
  }

  async logout(token: string) {

    const decoded = this.jwtService.decode(token) as any;

    if (!decoded || !decoded.exp) {
      throw new Error('Invalid token');
    }

    await this.prisma.blacklistedToken.create({
      data: {
        token,
        expiresAt: new Date(decoded.exp * 1000),
      },
    });

    return { message: 'Logged out successfully' };
  }

  findAll(){
    return this.prisma.user.findMany()
  }
}

