import { Test, TestingModule } from '@nestjs/testing';
import { AppointmentService } from './appointment.service';
import { PrismaService } from '../prisma/prisma.service';
import { AppointmentStatus, ScheduleType } from '../generated/prisma/enums';

describe('AppointmentService', () => {
    let service: AppointmentService;
    let prisma: PrismaService;

    const mockPrismaService = {
        doctor: {
            findMany: jest.fn(),
        },
        patient: {
            findUnique: jest.fn(),
        },
        customAvailability: {
            findFirst: jest.fn(),
        },
        doctorAvailability: {
            findMany: jest.fn(),
        },
        appointment: {
            findMany: jest.fn(),
            create: jest.fn(),
            findUnique: jest.fn(),
            update: jest.fn(),
        },
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AppointmentService,
                { provide: PrismaService, useValue: mockPrismaService },
            ],
        }).compile();

        service = module.get<AppointmentService>(AppointmentService);
        prisma = module.get<PrismaService>(PrismaService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('getAvailableSlots', () => {
        it('should return empty slots if doctor is unavailable (custom exception)', async () => {
            mockPrismaService.customAvailability.findFirst.mockResolvedValue({
                status: 'UNAVAILABLE',
            });

            const slots = await service.getAvailableSlots(1, '2026-02-20');
            expect(slots).toEqual([]);
        });

        it('should generate a single slot for STREAM scheduling with full duration', async () => {
            mockPrismaService.customAvailability.findFirst.mockResolvedValue(null);
            mockPrismaService.doctorAvailability.findMany.mockResolvedValue([
                {
                    scheduleType: ScheduleType.STREAM,
                    startTime: '09:00',
                    endTime: '10:00',
                    slotDuration: 30, // should be ignored
                    maxCount: 2,
                },
            ]);
            mockPrismaService.appointment.findMany.mockResolvedValue([
                { startTime: '09:00', endTime: '10:00', status: AppointmentStatus.UPCOMING },
            ]);

            const slots = await service.getAvailableSlots(1, '2026-02-23'); // A Monday

            expect(slots).toHaveLength(1);
            expect(slots[0]).toEqual({
                startTime: '09:00',
                endTime: '10:00',
                type: ScheduleType.STREAM,
                availableCapacity: 1, // 2 - 1 = 1
                period: 'MORNING',
            });
        });

        it('should generate slots for WAVE scheduling with capacity', async () => {
            mockPrismaService.customAvailability.findFirst.mockResolvedValue(null);
            mockPrismaService.doctorAvailability.findMany.mockResolvedValue([
                {
                    scheduleType: ScheduleType.WAVE,
                    startTime: '17:00',
                    endTime: '18:00',
                    slotDuration: 30,
                    maxCount: 3,
                },
            ]);
            mockPrismaService.appointment.findMany.mockResolvedValue([
                { startTime: '17:00', endTime: '17:30', status: AppointmentStatus.UPCOMING },
            ]);

            const slots = await service.getAvailableSlots(1, '2026-02-23');

            expect(slots).toHaveLength(2);
            expect(slots[0].startTime).toBe('17:00');
            expect(slots[0].availableCapacity).toBe(2); // 3 - 1 = 2
            expect(slots[1].startTime).toBe('17:30');
            expect(slots[1].availableCapacity).toBe(3);
        });
    });
});
