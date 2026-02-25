import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HelloModule } from './hello/hello.module';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { MailModule } from './mail/mail.module';
import { DoctorModule } from './doctor/doctor.module';
import { PatientModule } from './patient/patient.module';
import { CustomAvailabilityModule } from './custom-availability/custom-availability.module';
import { AppointmentModule } from './appointment/appointment.module';
import { ElasticSchedulingModule } from './elastic-scheduling/elastic-scheduling.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    HelloModule,
    PrismaModule,
    UserModule,
    AuthModule,
    MailModule,
    DoctorModule,
    PatientModule,
    CustomAvailabilityModule,
    AppointmentModule,
    ElasticSchedulingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
