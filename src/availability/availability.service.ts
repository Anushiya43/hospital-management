import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAvailabilityDto } from './dto/create-availability.dto';

@Injectable()
export class AvailabilityService {
  constructor(private prisma: PrismaService) { }

  async create(userId: number, dto: CreateAvailabilityDto) {
    const doctor = await this.prisma.doctor.findUnique({
      where: { userId },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }
    

    const overlapping = await this.prisma.doctorAvailability.findFirst({
      where: {
        doctorId: doctor.doctorId,
        dayOfWeek: {
          hasSome: dto.dayOfWeek, // checks if any day overlaps
        },
        startTime: {
          lt: dto.endTime,
        },
        endTime: {
          gt: dto.startTime,
        },
      },
    });

    if (overlapping) {
      throw new BadRequestException('Time slot overlaps with existing availability');
    }

    return this.prisma.doctorAvailability.create({
      data: {
        doctorId: doctor.doctorId,
        dayOfWeek: dto.dayOfWeek,
        startTime: dto.startTime,
        endTime: dto.endTime,
        slotDuration: dto.slotDuration,
        maxCount: dto.maxCount,
      },
    });
  }


  async findMyAvailability(userId: number) {
    const doctor = await this.prisma.doctor.findUnique({
      where: { userId },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    return this.prisma.doctorAvailability.findMany({
      where: { doctorId: doctor.doctorId },
    });
  }

  async deleteAvailability(userId: number, availabilityId: number) {
    const doctor = await this.prisma.doctor.findUnique({
      where: { userId },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    return this.prisma.doctorAvailability.delete({
      where: {
        id: availabilityId,
        doctorId: doctor.doctorId,
      },
    });
  }
}
