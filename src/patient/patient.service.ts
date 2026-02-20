import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { PrismaService } from 'src/prisma/prisma.service';


@Injectable()
export class PatientService {
  constructor(
    private prisma: PrismaService
  ) { }

  async create(userId: number, createPatientDto: CreatePatientDto) {
    const existingPatient = await this.prisma.patient.findUnique({
      where: { userId },
    });

    if (existingPatient) {
      throw new BadRequestException('Patient already registered');
    }

    if (!createPatientDto.birthDate) {
      throw new BadRequestException('Birth date is required');
    }

    console.log(createPatientDto)
    return this.prisma.patient.create({
      data: {
        userId,
        fullName: createPatientDto.fullName,
        gender: createPatientDto.gender,
        birthDate: new Date(createPatientDto.birthDate)
      }
    })
  }

  async findAll() {
    return await this.prisma.patient.findMany();
  }

  async findOne(userId: number) {
    return await this.prisma.patient.findFirst({
      where: { userId, }
    });
  }

  async update(userId: number, updatePatientDto: UpdatePatientDto) {
    const patient = await this.prisma.patient.findUnique({
      where: { userId },
    });

    if (!patient) {
      throw new NotFoundException('Patient profile not found');
    }

    try {
      return await this.prisma.patient.update({
        where: { userId },
        data: {
          fullName: updatePatientDto.fullName,
          gender: updatePatientDto.gender,
          ...(updatePatientDto.birthDate && {
            birthDate: new Date(updatePatientDto.birthDate),
          }),
        },
      });
    } catch (error) {
      console.error('Error updating patient profile:', error);
      throw error;
    }
  }

  remove(userId: number) {
    return this.prisma.patient.delete({
      where: { userId }
    })
  }
}
