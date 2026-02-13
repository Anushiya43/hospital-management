import { DayOfWeek } from "src/generated/prisma/enums"


export class CreateAvailabilityDto {
dayOfWeek : DayOfWeek[]
startTime : string
endTime : string
slotDuration : number
maxCount : number
}
