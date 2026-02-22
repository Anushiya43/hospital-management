import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { UserRole } from '../../generated/prisma/enums';
import * as bcrypt from 'bcrypt';
import { MailService } from '../../mail/mail.service';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) { }

  /* google login */

  async googleLogin(googleUser: any) {
    let user = await this.prisma.user.findUnique({
      where: { email: googleUser.email },
    });
    console.log(googleUser)
    if (!user) {
      // Create user if they don't exist
      const role =
        googleUser.role === 'DOCTOR' ? UserRole.DOCTOR : UserRole.PATIENT;
      user = await this.prisma.user.create({
        data: {
          email: googleUser.email,
          provider: 'GOOGLE',
          providerId: googleUser.providerId,
          role: role,
        },
      });

      // Create profile (Patient or Doctor)
      const fullName = `${googleUser.firstName || ''} ${googleUser.lastName || ''}`.trim() || (googleUser.email ? googleUser.email.split('@')[0] : 'User');

      if (role === UserRole.PATIENT) {
        await this.prisma.patient.create({
          data: {
            userId: user.id,
            fullName: fullName,
          },
        });
      } else if (role === UserRole.DOCTOR) {
        await this.prisma.doctor.create({
          data: {
            userId: user.id,
            fullName: fullName,
            experienceYears: 0,
            specialization: [],
          },
        });
      }
      console.log('Created user and profile:', user);
    }
    return this.generateToken(user);
  }

  /* send email otp */

  async sendEmailOtp(email: string) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const otpHash = await bcrypt.hash(otp, 10);

    await this.prisma.emailOtp.create({
      data: {
        email,
        otp: otpHash,
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
    if (record.expiresAt < new Date())
      throw new UnauthorizedException('OTP expired');
    const isValid = await bcrypt.compare(otp, record.otp);
    console.log(isValid);
    if (!isValid) throw new UnauthorizedException('Invalid OTP');
    console.log(record);

    const verifyemail = await this.prisma.emailOtp.findFirst({
      where: { email },
      orderBy: { createdAt: 'desc' },
    });

    if (!verifyemail) {
      throw new BadRequestException('User not found');
    }

    await this.prisma.emailOtp.update({
      where: { id: verifyemail.id },
      data: { verified: true },
    });

    return { message: 'Email verified successfully' };
  }


  /* register */
  async register(dto: RegisterDto) {
    console.log(dto)

    const verifyemail = await this.prisma.emailOtp.findFirst({
      where: { email: dto.email, },
      orderBy: { createdAt: "desc" }
    })

    if (!verifyemail?.verified) {
      throw new BadRequestException("Email doesn't verified");
    }


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

    if (user.role === UserRole.PATIENT) {
      await this.prisma.patient.create({
        data: {
          userId: user.id,
          fullName: dto.fullName || (user.email ? user.email.split('@')[0] : 'Patient'), // Fallback to email username if fullName not provided
        },
      });
    }

    return user

  }

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
}
