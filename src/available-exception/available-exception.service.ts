import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateAvailableExceptionDto } from './dto/create-available-exception.dto';
import { UpdateAvailableExceptionDto } from './dto/update-available-exception.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AvailableExceptionService {
  constructor(private prisma: PrismaService) { }

  async create(userId: number, dto: CreateAvailableExceptionDto) {

  const doctor = await this.prisma.doctor.findUnique({
    where: { userId },
  });

  if (!doctor) {
    throw new NotFoundException('Doctor not found');
  }

  const startDate = new Date(dto.startDate);
  const endDate = dto.endDate ? new Date(dto.endDate) : null;
  const overlapEndDate = endDate || startDate;

  // Check UNAVAILABLE overlap
    const overlapping =
      await this.prisma.doctorAvailabilityException.findFirst({
        where: {
          doctorId: doctor.doctorId,
          type: "UNAVAILABLE",

          AND: [
            { startDate: { lte: overlapEndDate } },
            {
              OR: [
                { endDate: null },
                { endDate: { gte: startDate } }
              ]
            }
          ]
        }
      });

    if (overlapping) {
      throw new BadRequestException(
        'UNAVAILABLE exception overlaps existing record'
      );
    }
  

  // Check AVAILABLE overlap

    const duplicate =
      await this.prisma.doctorAvailabilityException.findFirst({
        where: {
          doctorId: doctor.doctorId,
          type: "AVAILABLE",

          AND: [

            // date overlap
            { startDate: { lte: overlapEndDate } },

            {
              OR: [
                { endDate: null },
                { endDate: { gte: startDate } }
              ]
            },

            // time overlap
            { startTime: { lt: dto.endTime } },
            { endTime: { gt: dto.startTime } }

          ]
        }
      });

    if (duplicate) {
      throw new BadRequestException(
        'AVAILABLE time slot overlaps existing record'
      );
    }
  


  return this.prisma.doctorAvailabilityException.create({
    data: {
      doctorId: doctor.doctorId,
      startDate,
      endDate,
      type: dto.type,
      reason: dto.reason,
      startTime: dto.startTime,
      endTime: dto.endTime,
      slotDuration: dto.slotDuration || 30
    },
  });

}


  findAll() {
    return `This action returns all availableException`;
  }

  async findOneException(exceptionId: number) {
    const exception =
      await this.prisma.doctorAvailabilityException.findUnique({
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


  async update(exceptionId: number, dto: UpdateAvailableExceptionDto) {
    const exception =
      await this.prisma.doctorAvailabilityException.findUnique({
        where: { id: exceptionId },
      });

    if (!exception) {
      throw new NotFoundException('Exception not found');
    }

    // Determine effective dates (new or existing)
    const startDate = dto.startDate ? new Date(dto.startDate) : exception.startDate;
    // endDate might be null for open-ended exceptions (though schema allows null endDate?) 
    // If startDate updated but endDate not provided, use exception.endDate.
    const endDate = dto.endDate !== undefined
      ? (dto.endDate ? new Date(dto.endDate) : null)
      : exception.endDate;

    // effective end date for comparison (if null, use far future or same as startDate?)
    // Let's assume null means "forever" or single day depend on logic.
    // For overlap check:
    // If exception implies single day when endDate is null: use startDate as endDate.
    const effectiveEndDate = endDate || startDate;

    const overlapping = await this.prisma.doctorAvailabilityException.findFirst({
      where: {
        doctorId: exception.doctorId,
        id: { not: exceptionId },
        AND: [
          { startDate: { lte: effectiveEndDate } },
          {
            OR: [
              { endDate: { gte: startDate } },
              { endDate: null } // if existing is open-ended, it overlaps everything after its start
            ]
          },
        ],
      },
    });

    console.log(overlapping)

    if (overlapping) {
      throw new BadRequestException('Availability exception overlaps with scan existing record.');
    }

    return this.prisma.doctorAvailabilityException.update({
      where: { id: exceptionId },
      data: {
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        type: dto.type,
        reason: dto.reason,
        startTime: dto.startTime,
        endTime: dto.endTime,
        slotDuration : dto.slotDuration || 30
      },
    });
  }

  async deleteException(exceptionId: number) {
    const exception =
      await this.prisma.doctorAvailabilityException.findUnique({
        where: { id: exceptionId },
      });

    if (!exception) {
      throw new NotFoundException('Exception not found');
    }

    return this.prisma.doctorAvailabilityException.delete({
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

    return this.prisma.doctorAvailabilityException.findMany({
      where: {
        doctorId: doctor.doctorId,

        AND: [
          {
            startDate: {
              lte: endOfMonth,
            },
          },
          {
            endDate: {
              gte: startOfMonth,
            },
          },
        ],
      },

      orderBy: {
        startDate: 'asc',
      },
    });
  }

}