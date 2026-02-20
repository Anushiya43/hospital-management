
import { IsEnum, IsNotEmpty } from 'class-validator';
import { AppointmentStatus } from 'src/generated/prisma/enums';

export class UpdateAppointmentStatusDto {
    @IsNotEmpty()
    @IsEnum(AppointmentStatus)
    status: AppointmentStatus;
}
