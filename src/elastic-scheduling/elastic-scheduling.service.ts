import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateElasticSlotDto } from './dto/create-elastic-slot.dto';
import { UpdateElasticSlotDto } from './dto/update-elastic-slot.dto';

@Injectable()
export class ElasticSchedulingService {
    constructor(private prisma: PrismaService) { }

    async createElasticSlot(doctorId: number, dto: CreateElasticSlotDto) {
        return this.prisma.elasticSlot.create({
            data: {
                doctorId,
                date: new Date(dto.date),
                startTime: dto.startTime,
                endTime: dto.endTime,
                maxCount: dto.maxCount,
                isActive: dto.isActive ?? true,
            },
        });
    }

    async updateElasticSlot(id: number, dto: UpdateElasticSlotDto) {
        const slot = await this.prisma.elasticSlot.findUnique({ where: { id } });
        if (!slot) throw new NotFoundException('Elastic slot not found');

        return this.prisma.elasticSlot.update({
            where: { id },
            data: {
                ...dto,
                date: dto.date ? new Date(dto.date) : undefined,
            },
        });
    }

    async getElasticSlots(doctorId: number, date?: string) {
        return this.prisma.elasticSlot.findMany({
            where: {
                doctorId,
                date: date ? new Date(date) : undefined,
            },
            include: {
                allocations: {
                    include: {
                        appointment: true,
                    },
                },
            },
        });
    }

    async getElasticSlotById(id: number) {
        const slot = await this.prisma.elasticSlot.findUnique({
            where: { id },
            include: {
                allocations: true,
            },
        });
        if (!slot) throw new NotFoundException('Elastic slot not found');
        return slot;
    }

    async deleteElasticSlot(id: number) {
        const slot = await this.prisma.elasticSlot.findUnique({
            where: { id },
            include: { allocations: true },
        });
        if (!slot) throw new NotFoundException('Elastic slot not found');

        if (slot.allocations.length > 0) {
            throw new BadRequestException('Cannot delete elastic slot with active allocations');
        }

        return this.prisma.elasticSlot.delete({ where: { id } });
    }

    async allocateToElasticSlot(appointmentId: number, elasticSlotId: number) {
        const slot = await this.prisma.elasticSlot.findUnique({
            where: { id: elasticSlotId },
            include: { allocations: true },
        });

        if (!slot) throw new NotFoundException('Elastic slot not found');
        if (!slot.isActive) throw new BadRequestException('Elastic slot is not active');
        if (slot.allocations.length >= slot.maxCount) {
            throw new BadRequestException('Elastic slot capacity reached');
        }

        return this.prisma.slotAllocation.create({
            data: {
                appointmentId,
                elasticSlotId,
            },
        });
    }

    async deallocateFromElasticSlot(appointmentId: number) {
        const allocation = await this.prisma.slotAllocation.findUnique({
            where: { appointmentId },
        });

        if (!allocation) return null;

        return this.prisma.slotAllocation.delete({
            where: { appointmentId },
        });
    }
}
