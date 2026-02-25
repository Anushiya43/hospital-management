import { IsNotEmpty, IsInt, IsString, IsDateString, IsOptional, IsBoolean } from 'class-validator';

export class CreateElasticSlotDto {
    @IsDateString()
    @IsNotEmpty()
    date: string;

    @IsString()
    @IsNotEmpty()
    startTime: string;

    @IsString()
    @IsNotEmpty()
    endTime: string;

    @IsInt()
    @IsNotEmpty()
    maxCount: number;

    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}
