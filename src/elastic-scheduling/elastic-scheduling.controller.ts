import { Controller, Post, Get, Patch, Delete, Body, Param, Req, UseGuards, ParseIntPipe, Query, NotFoundException } from '@nestjs/common';
import { ElasticSchedulingService } from './elastic-scheduling.service';
import { CreateElasticSlotDto } from './dto/create-elastic-slot.dto';
import { UpdateElasticSlotDto } from './dto/update-elastic-slot.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.gurd';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { PrismaService } from '../prisma/prisma.service';

@Controller('elastic-scheduling')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ElasticSchedulingController {
    constructor(
        private readonly elasticSchedulingService: ElasticSchedulingService,
        private readonly prisma: PrismaService,
    ) { }

    @Post('slots')
    @Roles('DOCTOR')
    async createSlot(@Req() req, @Body() dto: CreateElasticSlotDto) {
        const doctor = await this.prisma.doctor.findUnique({
            where: { userId: req.user.sub },
        });
        if (!doctor) throw new NotFoundException('Doctor profile not found');
        return this.elasticSchedulingService.createElasticSlot(doctor.doctorId, dto);
    }

    @Get('slots')
    async getSlots(@Query('doctorId', ParseIntPipe) doctorId: number, @Query('date') date?: string) {
        return this.elasticSchedulingService.getElasticSlots(doctorId, date);
    }

    @Get('my-slots')
    @Roles('DOCTOR')
    async getMySlots(@Req() req, @Query('date') date?: string) {
        const doctor = await this.prisma.doctor.findUnique({
            where: { userId: req.user.sub },
        });
        if (!doctor) throw new NotFoundException('Doctor profile not found');
        return this.elasticSchedulingService.getElasticSlots(doctor.doctorId, date);
    }

    @Patch('slots/:id')
    @Roles('DOCTOR')
    async updateSlot(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateElasticSlotDto) {
        return this.elasticSchedulingService.updateElasticSlot(id, dto);
    }

    @Delete('slots/:id')
    @Roles('DOCTOR')
    async deleteSlot(@Param('id', ParseIntPipe) id: number) {
        return this.elasticSchedulingService.deleteElasticSlot(id);
    }

    @Post('allocate')
    @Roles('DOCTOR', 'ADMIN') // Usually automated during booking, but providing an endpoint for manual management
    async allocate(@Body('appointmentId', ParseIntPipe) appointmentId: number, @Body('elasticSlotId', ParseIntPipe) elasticSlotId: number) {
        return this.elasticSchedulingService.allocateToElasticSlot(appointmentId, elasticSlotId);
    }
}
