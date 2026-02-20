import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DoctorService {
  constructor(
    private prisma: PrismaService
  ) { }
  async create(userId: number, createDoctorDto: CreateDoctorDto) {
    try {
      return await this.prisma.doctor.create({
        data: {
          userId,
          fullName: createDoctorDto.fullName,
          specialization: createDoctorDto.specialization,
          experienceYears: createDoctorDto.experienceYears,
        },
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Doctor profile already exists for this user');
      }
      if (error.code === 'P2003') {
        throw new BadRequestException('User account not found. Please ensure you are logged in with a valid user.');
      }
      console.error('Error creating doctor profile:', error);
      throw error;
    }
  }

  findAll() {
    return this.prisma.doctor.findMany()
  }

  findOne(userId: number) {
    return this.prisma.doctor.findUnique({
      where: { userId, },
    });
  }

  update(userId: number, updateDoctorDto: UpdateDoctorDto) {
    console.log(updateDoctorDto)
    return this.prisma.doctor.update({
      where: { userId: userId },
      data: updateDoctorDto
    })
  }

  async remove(userId: number) {
    const doctor = await this.prisma.doctor.findUnique({
      where: { userId },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor profile not found');
    }

    return this.prisma.doctor.delete({
      where: { userId },
    });
  }

}