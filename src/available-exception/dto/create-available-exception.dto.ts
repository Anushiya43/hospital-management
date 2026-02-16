import { AvailabilityExceptionType } from "src/generated/prisma/enums"

export class CreateAvailableExceptionDto {
    startDate :Date;
    endDate   :Date;
    type      :AvailabilityExceptionType;
    reason    :string;
}
