import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { ScheduleType, AvailabilityStatus } from "../../generated/prisma/enums"

export class CreateCustomAvailabilityDto {
    @IsString()
    date: string; // Will be converted to Date

    @IsOptional()
    @IsEnum(ScheduleType)
    scheduleType?: ScheduleType;

    @IsEnum(AvailabilityStatus)
    status: AvailabilityStatus;

    @IsOptional()
    @IsString()
    reason?: string;

    @IsOptional()
    @IsString()
    startTime?: string;

    @IsOptional()
    @IsString()
    endTime?: string;

    @IsOptional()
    @IsInt()
    slotDuration?: number;

    @IsOptional()
    @IsInt()
    maxCount?: number;
}
