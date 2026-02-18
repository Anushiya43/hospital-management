import { IsString, IsArray, ArrayNotEmpty, IsInt, Min, IsOptional } from 'class-validator';

export class CreateDoctorDto {
	@IsString()
	fullName: string;

	@IsArray()
	@ArrayNotEmpty()
	specialization: string[];

	@IsInt()
	@Min(0)
	experienceYears: number;
}
