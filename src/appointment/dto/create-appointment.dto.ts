import { IsDateString, IsEnum, IsInt, IsNotEmpty, IsString, Matches } from 'class-validator';
import { ScheduleType } from 'src/generated/prisma/enums';

export class CreateAppointmentDto {
    @IsInt()
    @IsNotEmpty()
    doctorId: number;

    @IsDateString()
    @IsNotEmpty()
    date: string;

    @IsString()
    @IsNotEmpty()
    @Matches(/^([01]\d|2[0-3]):?([0-5]\d)$/, { message: 'startTime must be in HH:mm format' })
    startTime: string;

    @IsString()
    @IsNotEmpty()
    @Matches(/^([01]\d|2[0-3]):?([0-5]\d)$/, { message: 'endTime must be in HH:mm format' })
    endTime: string;

    @IsEnum(ScheduleType)
    @IsNotEmpty()
    type: ScheduleType;
}
