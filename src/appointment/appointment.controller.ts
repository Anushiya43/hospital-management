import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Query, UseGuards, Req, Patch } from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentStatusDto } from './dto/update-appointment-status.dto';
import { RescheduleAppointmentDto } from './dto/reschedule-appointment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.gurd';

@Controller('appointments')
@UseGuards(JwtAuthGuard)
export class AppointmentController {
    constructor(private readonly appointmentService: AppointmentService) { }

    @Get('search-doctors')
    searchDoctors(@Query('query') query: string) {
        return this.appointmentService.searchDoctors(query);
    }

    @Get('available-slots')
    getSlots(
        @Query('doctorId', ParseIntPipe) doctorId: number,
        @Query('date') date: string,
    ) {
        return this.appointmentService.getAvailableSlots(doctorId, date);
    }

    @Post('book')
    @UseGuards(JwtAuthGuard)
    book(@Req() req, @Body() dto: CreateAppointmentDto) {
        return this.appointmentService.bookAppointment(req.user.sub, dto);
    }

    @Get('my-appointments')
    @UseGuards(JwtAuthGuard)
    async getMyAppointments(@Req() req) {
        return this.appointmentService.getMyAppointments(req.user.sub);
    }

    @Get('doctor-appointments')
    @UseGuards(JwtAuthGuard)
    getDoctorAppointments(@Req() req) {
        return this.appointmentService.getDoctorAppointments(req.user.sub);
    }

    @Delete(':id/cancel')
    cancel(@Req() req, @Param('id', ParseIntPipe) id: number) {
        return this.appointmentService.cancelAppointment(req.user.sub, id);
    }

    @Patch(':id/reschedule')
    @UseGuards(JwtAuthGuard)
    reschedule(
        @Req() req,
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: RescheduleAppointmentDto,
    ) {
        return this.appointmentService.rescheduleAppointment(req.user.sub, id, dto);
    }

    @Patch(':id/status')
    @UseGuards(JwtAuthGuard)
    updateStatus(
        @Req() req,
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateAppointmentStatusDto,
    ) {
        return this.appointmentService.updateAppointmentStatus(req.user.sub, id, dto.status);
    }
}
