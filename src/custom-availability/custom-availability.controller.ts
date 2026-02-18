import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, ParseIntPipe, Query } from '@nestjs/common';
import { CustomAvailabilityService } from './custom-availability.service';
import { CreateCustomAvailabilityDto } from './dto/create-custom-availability.dto';
import { UpdateCustomAvailabilityDto } from './dto/update-custom-availability.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.gurd';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('custom-availability')
@UseGuards(JwtAuthGuard)
@Roles('DOCTOR')
export class CustomAvailabilityController {
  constructor(private readonly customAvailabilityService: CustomAvailabilityService) { }

  @Post()
  create(@Req() req, @Body() createCustomAvailabilityDto: CreateCustomAvailabilityDto) {
    return this.customAvailabilityService.create(+req.user.sub, createCustomAvailabilityDto);
  }

  @Get('month')
  async findWithinMonth(
    @Req() req,
    @Query('year', ParseIntPipe) year: number,
    @Query('month', ParseIntPipe) month: number,
  ) {
    return this.customAvailabilityService.findExceptionsWithinMonth(
      req.user.sub,
      year,
      month,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.customAvailabilityService.findOneException(+id);
  }

  

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.customAvailabilityService.deleteException(+id);
  }
}
