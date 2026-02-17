import { Module } from '@nestjs/common';
import { AvailableExceptionService } from './available-exception.service';
import { AvailableExceptionController } from './available-exception.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { DoctorModule } from 'src/doctor/doctor.module';

@Module({
  imports: [PrismaModule,DoctorModule],
  controllers: [AvailableExceptionController],
  providers: [AvailableExceptionService],
})
export class AvailableExceptionModule {}
