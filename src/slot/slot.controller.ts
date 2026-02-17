import { Controller, Get, Param, Query } from '@nestjs/common';
import { SlotService } from './slot.service';

@Controller('slots')
export class SlotController {

  constructor(private slotService: SlotService) { }

  @Get(':doctorId')
  getSlots(
    @Param('doctorId') doctorId: string,
    @Query('date') date: Date,
  ) {
    return this.slotService.getSlots(+doctorId, date);
  }

}

