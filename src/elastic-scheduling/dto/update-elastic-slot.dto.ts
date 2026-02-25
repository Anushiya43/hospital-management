import { PartialType } from '@nestjs/mapped-types';
import { CreateElasticSlotDto } from './create-elastic-slot.dto';

export class UpdateElasticSlotDto extends PartialType(CreateElasticSlotDto) { }
