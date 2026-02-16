import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAvailableExceptionDto } from './dto/create-available-exception.dto';
import { UpdateAvailableExceptionDto } from './dto/update-available-exception.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AvailableExceptionService {
    constructor( private prisma: PrismaService){}

  async create(userId: number ,dto: CreateAvailableExceptionDto) {
    const doctor = await this.prisma.doctor.findUnique({
        where: { userId },
      });

    if (!doctor) {
    throw new NotFoundException('Doctor not found');
  }

  return this.prisma.doctorAvailabilityException.create({
    data: {
      doctorId: doctor.doctorId,
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
      type: dto.type,
      reason: dto.reason,
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
      where: { id:exceptionId },
    });

  if (!exception) {
    throw new NotFoundException('Exception not found');
  }

  return this.prisma.doctorAvailabilityException.update({
    where: { id : exceptionId },
    data: {
      startDate: dto.startDate ? new Date(dto.startDate) : undefined,
      endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      type: dto.type,
      reason: dto.reason,
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