import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateCustomAvailabilityDto } from './dto/create-custom-availability.dto';
import { UpdateCustomAvailabilityDto } from './dto/update-custom-availability.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ScheduleType } from 'src/generated/prisma/enums';

@Injectable()
export class CustomAvailabilityService {
  constructor(private prisma: PrismaService) { }

  async create(userId: number, dto: CreateCustomAvailabilityDto) {
    const doctor = await this.prisma.doctor.findUnique({
      where: { userId },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    const targetDate = new Date(dto.date);
    if (isNaN(targetDate.getTime())) {
      throw new BadRequestException('Invalid date provided.');
    }
    targetDate.setHours(0, 0, 0, 0);

    // If this is a full-day override (no startTime)
    if (!dto.startTime) {
      console.log('Checking for existing record on date:', targetDate);
      const anyExist = await this.prisma.customAvailability.findFirst({
        where: {
          doctorId: doctor.doctorId,
          date: targetDate,
        },
      });
      if (anyExist) {
        throw new BadRequestException('A record already exists for this date. Remove it before adding a full-day override.');
      }
    } else {
      if (!dto.endTime) {
        throw new BadRequestException('endTime is required when startTime is provided.');
      }
      console.log('Checking for overlap on date:', targetDate, 'range:', dto.startTime, 'to', dto.endTime);
      // Check for overlap with existing range records OR a full-day record
      const overlapping = await this.prisma.customAvailability.findFirst({
        where: {
          doctorId: doctor.doctorId,
          date: targetDate,
          OR: [
            { startTime: null }, // Full day override exists
            {
              AND: [
                { startTime: { lt: dto.endTime } },
                { endTime: { gt: dto.startTime } },
              ],
            },
          ],
        },
      });

      if (overlapping) {
        throw new BadRequestException('Overlap detected with an existing custom availability record.');
      }
    }

    return this.prisma.customAvailability.create({
      data: {
        doctorId: doctor.doctorId,
        date: targetDate,
        scheduleType: dto.scheduleType || ScheduleType.STREAM,
        status: dto.status,
        reason: dto.reason,
        startTime: dto.startTime,
        endTime: dto.endTime,
        slotDuration: dto.slotDuration || 30,
        maxCount: dto.maxCount || 1,
      },
    });
  }

  findAll() {
    return this.prisma.customAvailability.findMany({
      include: { doctor: true },
    });
  }

  async findOneException(exceptionId: number) {
    const exception = await this.prisma.customAvailability.findUnique({
      where: { id: exceptionId },
      include: {
        doctor: true,
      },
    });

    if (!exception) {
      throw new NotFoundException('Exception not found');
    }

    return exception;
  }


  async deleteException(exceptionId: number) {
    const exception = await this.prisma.customAvailability.findUnique({
      where: { id: exceptionId },
    });

    if (!exception) {
      throw new NotFoundException('Exception not found');
    }

    // Check for booked appointments on this specific date
    const bookedAppointments = await this.prisma.appointment.findMany({
      where: {
        doctorId: exception.doctorId,
        date: exception.date,
        status: 'UPCOMING',
      },
    });

    let conflictingAppointment: any = null;

    if (exception.startTime && exception.endTime) {
      const start = exception.startTime;
      const end = exception.endTime;
      // If it's a specific time range, check for overlap
      conflictingAppointment = bookedAppointments.find((app) => {
        return (
          app.startTime < end && app.endTime > start
        );
      });
    } else {
      // If no startTime, it usually means full day UNAVAILABLE or full day override
      // But let's check if there are ANY appointments on that day
      conflictingAppointment = bookedAppointments[0];
    }

    if (conflictingAppointment) {
      throw new BadRequestException(
        'Cannot delete custom availability because appointments are already booked for this period.',
      );
    }

    return this.prisma.customAvailability.delete({
      where: { id: exceptionId },
    });
  }

  async findExceptionsWithinMonth(
    userId: number,
    year: number,
    month: number,
  ) {
    const doctor = await this.prisma.doctor.findUnique({
      where: { userId },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59);

    return this.prisma.customAvailability.findMany({
      where: {
        doctorId: doctor.doctorId,
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      orderBy: {
        date: 'asc',
      },
    });
  }
}