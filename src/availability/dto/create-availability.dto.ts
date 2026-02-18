import { DayOfWeek, ScheduleType } from "src/generated/prisma/enums"
import { IsArray, ArrayNotEmpty, IsEnum, IsString, Matches, IsInt, Min } from 'class-validator'
import { Transform } from 'class-transformer'

const TIME_REGEX = /^(?:[01]\d|2[0-3]):[0-5]\d$/

export class CreateAvailabilityDto {
	@IsArray()
	@ArrayNotEmpty()
	@IsEnum(DayOfWeek, { each: true })
	dayOfWeek: DayOfWeek[];

	/**
	 * Start time in 24-hour format (HH:mm), e.g., '13:00' for 1pm
	 */
	@Transform(({ value }) => typeof value === 'string' ? value.replace(/\s+/g, '') : value)
	@IsString()
	@Matches(TIME_REGEX, { message: 'Invalid time format, expected HH:mm' })
	startTime: string;

	/**
	 * End time in 24-hour format (HH:mm), e.g., '16:00' for 4pm
	 */
	@Transform(({ value }) => typeof value === 'string' ? value.replace(/\s+/g, '') : value)
	@IsString()
	@Matches(TIME_REGEX, { message: 'Invalid time format, expected HH:mm' })
	endTime: string;

	@IsInt()
	@Min(1)
	slotDuration: number;

	@IsInt()
	@Min(1)
	maxCount: number;
}
