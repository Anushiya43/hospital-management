import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DoctorService {
  constructor(
    private prisma : PrismaService
  ){}
  create(userId:number,createDoctorDto: CreateDoctorDto) {
    return this.prisma.doctor.create(
     { data :
      {
      userId,
      fullName: createDoctorDto.fullName,
      specialization: createDoctorDto.specialization,
      experienceYears: createDoctorDto.experienceYears
      } 
    });
  }

  findAll() {
    return this.prisma.doctor.findMany()
  }

  findOne(userId: number) {
    return this.prisma.doctor.findUnique({
      where:{userId,},
  });
  }

  update(userId: number, updateDoctorDto: UpdateDoctorDto) {
    console.log(updateDoctorDto)
    return this.prisma.doctor.update({
      where : {userId : userId},
      data : updateDoctorDto
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