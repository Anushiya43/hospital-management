import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService, ConfigModule } from '@nestjs/config';
import { AuthService } from './services/auth.service';
import { AuthController } from './controllers/auth.controller';
import { GoogleStrategy } from './strategies/google.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { PrismaService } from '../prisma/prisma.service';
import { MailModule } from 'src/mail/mail.module';
import {
  GoogleDoctorGuard,
  GooglePatientGuard,
} from './guards/google-auth.guard';
import { RolesGuard } from './guards/roles.guard';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    MailModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const expiresIn = configService.get<string>('JWT_EXPIRATION');
        return {
          secret: configService.get<string>('JWT_SECRET'),
          signOptions: expiresIn && expiresIn !== 'never' ? { expiresIn: expiresIn as any } : {},
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    GoogleStrategy,
    JwtStrategy,
    PrismaService,
    GoogleDoctorGuard,
    GooglePatientGuard,
    RolesGuard,
  ],
  exports: [JwtModule, PassportModule, AuthService, RolesGuard],
})
export class AuthModule { }
