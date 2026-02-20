import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { DoctorService } from './doctor.service';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.gurd';



@Controller('doctor')
export class DoctorController {
  constructor(private readonly doctorService: DoctorService) { }


  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Req() req, @Body() createDoctorDto: CreateDoctorDto) {
    console.log(createDoctorDto)
    return this.doctorService.create(req.user.sub, createDoctorDto);
  }

  @Get('list')
  findAll() {
    return this.doctorService.findAll();
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  findOne(@Req() req) {
    return this.doctorService.findOne(req.user.sub);
  }

  @Patch("profile")
  @UseGuards(JwtAuthGuard)
  update(@Req() req, @Body() updateDoctorDto: UpdateDoctorDto) {
    return this.doctorService.update(req.user.sub, updateDoctorDto);
  }

  @Delete("profile")
  @UseGuards(JwtAuthGuard)
  remove(@Req() req) {
    return this.doctorService.remove(req.user.sub);
  }
}