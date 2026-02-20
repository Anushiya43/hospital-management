import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { AppointmentStatus, ScheduleType } from 'src/generated/prisma/enums';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AppointmentService {
    constructor(private prisma: PrismaService) { }

    async searchDoctors(query: string) {
        return this.prisma.doctor.findMany({
            where: {
                OR: [
                    { fullName: { contains: query, mode: 'insensitive' } },
                    { specialization: { hasSome: [query] } },
                ],
                isActive: true,
            },
        });
    }

    async getAvailableSlots(doctorId: number, date: string): Promise<any[]> {
        const targetDate = new Date(date);
        targetDate.setHours(0, 0, 0, 0);

        const dayOfWeek = this.getDayOfWeek(targetDate);

        // 1. Check Custom Availability (exceptions)
        const custom = await this.prisma.customAvailability.findFirst({
            where: {
                doctorId,
                date: targetDate,
            },
        });

        if (custom && custom.status === 'UNAVAILABLE') {
            return [];
        }

        let availabilitySource: any[] = [];

        if (custom && custom.status === 'AVAILABLE') {
            availabilitySource = [custom];
        } else {
            // 2. Check Regular Availability
            availabilitySource = await this.prisma.doctorAvailability.findMany({
                where: {
                    doctorId,
                    dayOfWeek: { has: dayOfWeek },
                    isActive: true,
                },
            });
        }
        console.log(availabilitySource)
        if (availabilitySource.length === 0) {
            return [];
        }

        // 3. Get existing appointments for the day
        const existingAppointments = await this.prisma.appointment.findMany({
            where: {
                doctorId,
                date: targetDate,
                status: AppointmentStatus.UPCOMING,
            },
        });

        const slots: any[] = [];

        for (const avail of availabilitySource) {
            const type = avail.scheduleType;
            const startTime = avail.startTime; // HH:mm
            const endTime = avail.endTime;     // HH:mm

            if (type === ScheduleType.STREAM) {
                // STREAM: Instead of multiple slots, create ONE single slot for the entire duration
                // with the full maxCount capacity. Each patient booked reduces capacity.
                const bookedCount = existingAppointments.filter((app) =>
                    app.startTime === startTime && app.endTime === endTime
                ).length;

                if (bookedCount < avail.maxCount) {
                    slots.push({
                        startTime: startTime,
                        endTime: endTime,
                        type,
                        availableCapacity: avail.maxCount - bookedCount,
                        period: this.getPeriod(startTime),
                    });
                }
                continue; // Skip the while loop for STREAM
            }

            let currentTime = this.timeToMinutes(startTime);
            const endMinutes = this.timeToMinutes(endTime);
            let duration = avail.slotDuration || 30;
            let slotMaxCount = avail.maxCount || 1;

            while (currentTime + duration <= endMinutes) {
                const slotStart = this.minutesToTime(currentTime);
                const slotEnd = this.minutesToTime(currentTime + duration);

                // Count existing bookings for this slot
                const bookedCount = existingAppointments.filter((app) =>
                    app.startTime === slotStart && app.endTime === slotEnd
                ).length;

                if (bookedCount < slotMaxCount) {
                    slots.push({
                        startTime: slotStart,
                        endTime: slotEnd,
                        type,
                        availableCapacity: slotMaxCount - bookedCount,
                        period: this.getPeriod(slotStart),
                    });
                }

                currentTime += duration;
            }
        }

        return slots;
    }

    async bookAppointment(patientUserId: number, dto: CreateAppointmentDto) {
        const patient = await this.prisma.patient.findUnique({
            where: { userId: patientUserId },
        });

        if (!patient) {
            throw new NotFoundException('Patient profile not found');
        }

        const targetDate = new Date(dto.date);
        targetDate.setHours(0, 0, 0, 0);

        // Verify slot availability (simplified check)
        const slots = await this.getAvailableSlots(dto.doctorId, dto.date);
        const validSlot = slots.find(s => s.startTime === dto.startTime && s.endTime === dto.endTime);

        if (!validSlot) {
            throw new BadRequestException('Slot is no longer available');
        }
        return this.prisma.appointment.create({
            data: {
                patientId: patient.id,
                doctorId: dto.doctorId,
                date: targetDate,
                startTime: dto.startTime,
                endTime: dto.endTime,
                type: dto.type,
                status: AppointmentStatus.UPCOMING,
            },
        });
    }

    async getMyAppointments(patientUserId: number) {
        const patient = await this.prisma.patient.findUnique({
            where: { userId: patientUserId },
        });

        if (!patient) {
            throw new NotFoundException('Patient profile not found');
        }

        return this.prisma.appointment.findMany({
            where: { patientId: patient.id },
            include: {
                doctor: true,
            },
            orderBy: { date: 'desc' },
        });
    }

    async getDoctorAppointments(doctorUserId: number) {
        const doctor = await this.prisma.doctor.findUnique({
            where: { userId: doctorUserId },
        });

        if (!doctor) {
            throw new NotFoundException('Doctor profile not found');
        }

        return this.prisma.appointment.findMany({
            where: { doctorId: doctor.doctorId },
            include: {
                patient: true,
            },
            orderBy: { date: 'desc' },
        });
    }

    async cancelAppointment(userId: number, appointmentId: number) {
        const appointment = await this.prisma.appointment.findUnique({
            where: { id: appointmentId },
            include: {
                patient: true,
                doctor: true,
            },
        });

        if (!appointment) {
            throw new NotFoundException('Appointment not found');
        }

        const isPatient = appointment.patient?.userId === userId;
        const isDoctor = appointment.doctor?.userId === userId;

        if (!isPatient && !isDoctor) {
            throw new NotFoundException('Appointment not found');
        }

        if (appointment.status !== AppointmentStatus.UPCOMING) {
            throw new BadRequestException('Only upcoming appointments can be canceled');
        }

        return this.prisma.appointment.update({
            where: { id: appointmentId },
            data: { status: AppointmentStatus.CANCELED },
        });
    }

    async updateAppointmentStatus(userId: number, appointmentId: number, status: AppointmentStatus) {
        const appointment = await this.prisma.appointment.findUnique({
            where: { id: appointmentId },
            include: { doctor: true },
        });

        if (!appointment) {
            throw new NotFoundException('Appointment not found');
        }

        // Only the assigned doctor can update the status (e.g., to COMPLETED)
        if (appointment.doctor?.userId !== userId) {
            throw new BadRequestException('Only the assigned doctor can update appointment status');
        }

        return this.prisma.appointment.update({
            where: { id: appointmentId },
            data: { status },
        });
    }

    private getDayOfWeek(date: Date): any {
        const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
        return days[date.getDay()];
    }

    private timeToMinutes(time: string): number {
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 60 + minutes;
    }

    private minutesToTime(minutes: number): string {
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    }

    private getPeriod(time: string): string {
        const [hours] = time.split(':').map(Number);
        if (hours < 12) return 'MORNING';
        if (hours < 17) return 'AFTERNOON';
        return 'EVENING';
    }
}
