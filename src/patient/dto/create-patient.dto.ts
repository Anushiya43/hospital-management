import { Gender } from "src/generated/prisma/enums"

export class CreatePatientDto {
    fullName : string
    gender : Gender
    birthDate : string
}
