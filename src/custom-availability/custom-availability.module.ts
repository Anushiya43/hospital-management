import { Module } from '@nestjs/common';
import { CustomAvailabilityService } from './custom-availability.service';
import { CustomAvailabilityController } from './custom-availability.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { DoctorModule } from 'src/doctor/doctor.module';

@Module({
  imports: [PrismaModule, DoctorModule],
  controllers: [CustomAvailabilityController],
  providers: [CustomAvailabilityService],
})
export class CustomAvailabilityModule { }
