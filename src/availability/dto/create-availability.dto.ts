import { DayOfWeek } from "src/generated/prisma/enums"


export class CreateAvailabilityDto {
	dayOfWeek : DayOfWeek[];
	/**
	 * Start time in 24-hour format (HH:mm), e.g., '13:00' for 1pm
	 */
	startTime : string;
	/**
	 * End time in 24-hour format (HH:mm), e.g., '16:00' for 4pm
	 */
	endTime : string;
	slotDuration : number;
	maxCount : number;
}
