import { Module } from '@nestjs/common';
import { ElasticSchedulingService } from './elastic-scheduling.service';
import { ElasticSchedulingController } from './elastic-scheduling.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [ElasticSchedulingService],
  controllers: [ElasticSchedulingController],
  exports: [ElasticSchedulingService],
})
export class ElasticSchedulingModule { }
