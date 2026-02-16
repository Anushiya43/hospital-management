import { Module } from '@nestjs/common';
import { DoctorService } from './doctor.service';
import { DoctorController } from './doctor.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AvailabilityController } from '../availability/availability.controller';
import { AvailabilityService } from '../availability/availability.service';

@Module({
  imports:[PrismaModule],
  controllers: [DoctorController,AvailabilityController],
  providers: [DoctorService,AvailabilityService],
})
export class DoctorModule {}
