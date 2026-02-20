import { Test, TestingModule } from '@nestjs/testing';
import { AvailabilityService } from 'src/availability/availability.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateAvailabilityDto } from 'src/availability/dto/create-availability.dto';
import { DayOfWeek, ScheduleType } from 'src/generated/prisma/enums';

describe('AvailabilityService', () => {
  let service: AvailabilityService;
  let prisma: PrismaService;

  const mockPrismaService = {
    doctor: {
      findUnique: jest.fn(),
    },
    doctorAvailability: {
      findFirst: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AvailabilityService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<AvailabilityService>(AvailabilityService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should take maxCount validation', async () => {
    (prisma.doctor.findUnique as jest.Mock).mockResolvedValue({ userId: 1, doctorId: 1 });
    const dto = {
      dayOfWeek: [DayOfWeek.MONDAY],
      startTime: '09:00',
      endTime: '10:00',
      // maxCount missing
    } as any;

    await expect(service.create(1, dto)).rejects.toThrow(BadRequestException);
  });

  it('should require slotDuration for WAVE scheduling', async () => {
    (prisma.doctor.findUnique as jest.Mock).mockResolvedValue({ userId: 1, doctorId: 1 });
    const dto: CreateAvailabilityDto = {
      dayOfWeek: [DayOfWeek.MONDAY],
      startTime: '09:00',
      endTime: '10:00',
      maxCount: 5,
      scheduleType: ScheduleType.WAVE,
      // slotDuration missing
      slotDuration: undefined,
    };

    await expect(service.create(1, dto)).rejects.toThrow(BadRequestException);
  });

  it('should allow valid STREAM scheduling', async () => {
    (prisma.doctor.findUnique as jest.Mock).mockResolvedValue({ userId: 1, doctorId: 1 });
    (prisma.doctorAvailability.findFirst as jest.Mock).mockResolvedValue(null);
    (prisma.doctorAvailability.create as jest.Mock).mockResolvedValue({});

    const dto: CreateAvailabilityDto = {
      dayOfWeek: [DayOfWeek.MONDAY],
      startTime: '09:00',
      endTime: '10:00',
      maxCount: 5,
      scheduleType: ScheduleType.STREAM,
    };

    await expect(service.create(1, dto)).resolves.not.toThrow();
  });
});
