import { Gender } from "src/generated/prisma/enums"
import { IsString, IsEnum, IsDateString } from 'class-validator';

export class CreatePatientDto {
    @IsString()
    fullName : string

    @IsEnum(Gender)
    gender : Gender

    @IsDateString()
    birthDate : string
}
