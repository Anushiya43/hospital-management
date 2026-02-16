import { Controller, Post, Get, Delete, Body, Param, Req, UseGuards, Patch, ParseIntPipe } from '@nestjs/common';
import { AvailabilityService } from './availability.service';
import { CreateAvailabilityDto } from './dto/create-availability.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.gurd';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UpdateAvailabilityDto } from './dto/update-availability.dto';


@Controller('availability')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('DOCTOR')
export class AvailabilityController {
  constructor(private availabilityService: AvailabilityService) { }

  @Post()
  create(@Req() req, @Body() dto: CreateAvailabilityDto) {
    return this.availabilityService.create(req.user.sub, dto);
  }

  @Get()
  getMyAvailability(@Req() req) {
    return this.availabilityService.findMyAvailability(req.user.sub);
  }

  @Delete(':id')
  delete(@Req() req, @Param('id', ParseIntPipe) id: number) {
    return this.availabilityService.deleteAvailability(
      req.user.sub,
      id,
    );
  }

}
