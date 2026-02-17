import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, ParseIntPipe, Query } from '@nestjs/common';
import { AvailableExceptionService } from './available-exception.service';
import { CreateAvailableExceptionDto } from './dto/create-available-exception.dto';
import { UpdateAvailableExceptionDto } from './dto/update-available-exception.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.gurd';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('available-exception')
@UseGuards(JwtAuthGuard)
@Roles('DOCTOR')
export class AvailableExceptionController {
  constructor(private readonly availableExceptionService: AvailableExceptionService) { }

  @Post()
  create(@Req() req, @Body() createAvailableExceptionDto: CreateAvailableExceptionDto) {
    return this.availableExceptionService.create(+req.user.sub, createAvailableExceptionDto);
  }

  @Get('month')
  async findWithinMonth(
    @Req() req,
    @Query('year', ParseIntPipe) year: number,
    @Query('month', ParseIntPipe) month: number,
  ) {
    return this.availableExceptionService.findExceptionsWithinMonth(
      req.user.sub,
      year,
      month,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.availableExceptionService.findOneException(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAvailableExceptionDto: UpdateAvailableExceptionDto) {
    console.log(updateAvailableExceptionDto)
    return this.availableExceptionService.update(+id, updateAvailableExceptionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.availableExceptionService.deleteException(+id);
  }
}
