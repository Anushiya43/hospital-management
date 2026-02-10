import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HelloModule } from './hello/hello.module';
import { PrismaModule } from './prisma/prisma.module'
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { RolesGuard } from './auth/guard/roles.guard';
import { APP_GUARD } from '@nestjs/core';
import { MailModule } from './mail/mail.module';
import { DoctorModule } from './doctor/doctor.module';

@Module({
  imports: [ConfigModule.forRoot({
      isGlobal: true,
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    HelloModule,PrismaModule,AuthModule, ConfigModule, MailModule,DoctorModule],
  controllers: [AppController],
  providers: [AppService,
  ],
})
export class AppModule {}
