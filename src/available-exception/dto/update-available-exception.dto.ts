import { PartialType } from '@nestjs/mapped-types';
import { CreateAvailableExceptionDto } from './create-available-exception.dto';

export class UpdateAvailableExceptionDto extends PartialType(CreateAvailableExceptionDto) {}
