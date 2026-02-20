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

    if (!dto.maxCount) {
      throw new BadRequestException("Max count is required");
    }

    const scheduleType = dto.scheduleType ?? "STREAM";

    if (scheduleType === "WAVE" && !dto.slotDuration) {
      throw new BadRequestException("Slot duration is required for WAVE scheduling");
    }
    if (!dto.startTime || !dto.endTime) {
      throw new BadRequestException("Invalid time");
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
        scheduleType: dto.scheduleType,
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

    const availability = await this.prisma.doctorAvailability.findUnique({
      where: { id: availabilityId, doctorId: doctor.doctorId },
    });

    if (!availability) {
      throw new NotFoundException('Availability not found');
    }

    // Check for booked appointments that overlap with this availability
    const bookedAppointments = await this.prisma.appointment.findMany({
      where: {
        doctorId: doctor.doctorId,
        status: 'UPCOMING',
        startTime: { gte: availability.startTime },
        endTime: { lte: availability.endTime },
      },
    });

    // We need to check if ANY of the booked appointments fall on the days specified in this availability
    const conflictingAppointment = bookedAppointments.find((app) => {
      const appDate = new Date(app.date);
      const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
      const dayName = days[appDate.getDay()];
      return availability.dayOfWeek.includes(dayName as any);
    });

    if (conflictingAppointment) {
      throw new BadRequestException(
        `Cannot delete availability because appointments are already booked (e.g., on ${conflictingAppointment.date.toISOString().split('T')[0]}).`,
      );
    }

    return this.prisma.doctorAvailability.delete({
      where: {
        id: availabilityId,
      },
    });
  }
}
