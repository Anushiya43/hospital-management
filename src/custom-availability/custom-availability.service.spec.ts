import { Test, TestingModule } from '@nestjs/testing';
import { CustomAvailabilityService } from './custom-availability.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { ScheduleType, availabilityStatus } from '../generated/prisma/enums';

describe('CustomAvailabilityService', () => {
  let service: CustomAvailabilityService;
  let prisma: PrismaService;

  const mockPrisma = {
    doctor: {
      findUnique: jest.fn(),
    },
    customAvailability: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomAvailabilityService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<CustomAvailabilityService>(CustomAvailabilityService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const dto = {
      date: '2026-03-01',
      scheduleType: ScheduleType.STREAM,
      status: availabilityStatus.AVAILABLE,
      reason: 'Holiday',
    };

    it('should throw NotFoundException if doctor does not exist', async () => {
      mockPrisma.doctor.findUnique.mockResolvedValue(null);
      await expect(service.create(1, dto)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if a record already exists and trying to add full-day', async () => {
      mockPrisma.doctor.findUnique.mockResolvedValue({ doctorId: 101 });
      mockPrisma.customAvailability.findFirst.mockResolvedValue({ id: 1 });
      await expect(service.create(1, dto)).rejects.toThrow(BadRequestException);
    });

    it('should successfully create a full-day override', async () => {
      mockPrisma.doctor.findUnique.mockResolvedValue({ doctorId: 101 });
      mockPrisma.customAvailability.findFirst.mockResolvedValue(null);
      mockPrisma.customAvailability.create.mockResolvedValue({ id: 1, ...dto });

      const result = await service.create(1, dto);
      expect(result).toBeDefined();
      expect(mockPrisma.customAvailability.create).toHaveBeenCalled();
    });

    it('should throw BadRequestException for overlapping range records', async () => {
      const rangeDto = {
        ...dto,
        status: availabilityStatus.AVAILABLE,
        startTime: '10:00',
        endTime: '12:00',
      };
      mockPrisma.doctor.findUnique.mockResolvedValue({ doctorId: 101 });
      mockPrisma.customAvailability.findFirst.mockResolvedValue({ id: 2 }); // Overlap

      await expect(service.create(1, rangeDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findOneException', () => {
    it('should throw NotFoundException if record not found', async () => {
      mockPrisma.customAvailability.findUnique.mockResolvedValue(null);
      await expect(service.findOneException(1)).rejects.toThrow(NotFoundException);
    });

    it('should return record details', async () => {
      const mockResult = { id: 1, date: new Date() };
      mockPrisma.customAvailability.findUnique.mockResolvedValue(mockResult);
      const result = await service.findOneException(1);
      expect(result).toEqual(mockResult);
    });
  });

  describe('update', () => {
    it('should successfully update record', async () => {
      const mockExisting = { id: 1, doctorId: 101, date: new Date(), startTime: '10:00', endTime: '11:00' };
      mockPrisma.customAvailability.findUnique.mockResolvedValue(mockExisting);
      mockPrisma.customAvailability.findFirst.mockResolvedValue(null);
      mockPrisma.customAvailability.update.mockResolvedValue({ ...mockExisting, reason: 'Updated' });

      const result = await service.update(1, { reason: 'Updated' });
      expect(result.reason).toBe('Updated');
    });
  });

  describe('deleteException', () => {
    it('should successfully delete record', async () => {
      mockPrisma.customAvailability.findUnique.mockResolvedValue({ id: 1 });
      mockPrisma.customAvailability.delete.mockResolvedValue({ id: 1 });

      const result = await service.deleteException(1);
      expect(result).toBeDefined();
    });
  });
});
