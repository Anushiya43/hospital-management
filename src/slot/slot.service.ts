import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import {
  AvailabilityExceptionType,
  AppointmentStatus,
  DayOfWeek
} from "src/generated/prisma/enums";

@Injectable()
export class SlotService {

  constructor(private prisma: PrismaService) {}

  async getSlots(doctorId: number, date: Date) {

    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0,0,0,0);

    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23,59,59,999);


    /*
      STEP 1: CHECK EXCEPTION
    */
  const exception =
  await this.prisma.doctorAvailabilityException.findMany({
    where: {
      doctorId,
      AND: [
        { startDate: { lte: endOfDay } },
        {
          OR: [
            { endDate: null },
            { endDate: {gte : startOfDay}}
          ]
        }
      ]
    },
    orderBy: {
        startDate: 'asc',
      },
  });

  console.log("...............")
      console.log(exception)

       
    /*
      STEP 2: GET BOOKED APPOINTMENTS
    */
    const appointments =
      await this.prisma.appointment.findMany({
        where: {
          doctorId,
          date: targetDate,
          status: AppointmentStatus.BOOKED
        }
      });

    const bookedSlots =
      appointments.map(a => a.startTime);

    /*
      STEP 3: EXCEPTION AVAILABLE
    */
    if (exception.length > 0) {      

  const availableSlots: string[] = [];

  for (const ex of exception) {

    if (ex.type === AvailabilityExceptionType.AVAILABLE) {

      if (!ex.startTime || !ex.endTime) {
        continue;
      }
      
      const slots = this.generateSlots(
        ex.startTime,
        ex.endTime,
        ex.slotDuration || 30
      );

      const filteredSlots = slots.filter(
        slot => !bookedSlots.includes(slot)
      );

      availableSlots.push(...filteredSlots);
    }
  }
  return this.groupSlotsByTimeOfDay(availableSlots);
}


    /*
      STEP 4: DEFAULT AVAILABILITY
    */
    const dayOfWeek =
      this.getDayOfWeek(targetDate);
    
    
    const availabilityRecords =
      await this.prisma.doctorAvailability.findMany({
        where: {
          doctorId,
          isActive: true,
          dayOfWeek: {
            has: dayOfWeek
          }
        }
      });
      console.log(availabilityRecords)
    let allSlots: string[] = [];

    for (const record of availabilityRecords) {

      const slots =
        this.generateSlots(
          record.startTime,
          record.endTime,
          record.slotDuration
        );

      allSlots.push(...slots);
    }

    /*
      STEP 5: REMOVE BOOKED SLOTS
    */
    allSlots = allSlots.filter(
      slot => !bookedSlots.includes(slot)
    );
    return this.groupSlotsByTimeOfDay(allSlots)
  }

  /*
    SLOT GENERATOR
  */
  private generateSlots(
    startTime: string,
    endTime: string,
    slotDuration: number
  ): string[] {

    const slots: string[] = [];

    let current =
      this.timeToMinutes(startTime);

    const end =
      this.timeToMinutes(endTime);

    while (current + slotDuration <= end ) {

      slots.push(
        this.minutesToTime(current)
      );

      current += slotDuration;
    }

    return slots;
  }

  private groupSlotsByTimeOfDay(slots: string[]) {
  const result: Record<string, string[]> = {};

  for (const time of slots) {
    const hour = parseInt(time.split(":")[0]);

    let key: string;

    if (hour >= 5 && hour < 12) {
      key = "morning";
    } else if (hour >= 12 && hour < 17) {
      key = "afternoon";
    } else if (hour >= 17 && hour < 21) {
      key = "evening";
    } else {
      key = "night";
    }

    if (!result[key]) {
      result[key] = [];
    }

    result[key].push(time);
  }

  return result;
}


  private timeToMinutes(time: string): number {

    const [hours, minutes] =
      time.split(":").map(Number);

    return hours * 60 + minutes;
  }

  private minutesToTime(minutes: number): string {

    const hours =
      Math.floor(minutes / 60)
        .toString()
        .padStart(2, "0");

    const mins =
      (minutes % 60)
        .toString()
        .padStart(2, "0");

    return `${hours}:${mins}`;
  }

  private getDayOfWeek(date: Date): DayOfWeek {

    const day =
      date
        .toLocaleDateString("en-US", {
          weekday: "long"
        })
        .toUpperCase();

    return DayOfWeek[
      day as keyof typeof DayOfWeek
    ];
  }

}
