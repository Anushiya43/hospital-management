import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { PatientService } from './patient.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.gurd';

@Controller('patient')
export class PatientController {
  constructor(private readonly patientService: PatientService) {}
  
  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Req() req, @Body() createPatientDto: CreatePatientDto) {
    console.log(createPatientDto)
    return this.patientService.create(req.user.sub,createPatientDto);
  }

  @Get()
  findAll() {
    return this.patientService.findAll();
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  findOne(@Req() req) {
    return this.patientService.findOne(req.user.sub);
  }

  @Patch('profile-update')
  @UseGuards(JwtAuthGuard)
  update(@Req() req, @Body() updatePatientDto: UpdatePatientDto) {
    console.log(updatePatientDto)
    return this.patientService.update(req.user.sub, updatePatientDto);
  }

  @Delete('profile')
  @UseGuards(JwtAuthGuard)
  remove(@Req() req) {
    return this.patientService.remove(req.user.sub);
  }
}
