import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { ScheduleType, availabilityStatus } from "../../generated/prisma/enums"

export class CreateCustomAvailabilityDto {
    @IsString()
    date: string; // Will be converted to Date

    @IsEnum(ScheduleType)
    scheduleType: ScheduleType;

    @IsEnum(availabilityStatus)
    status: availabilityStatus;

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
