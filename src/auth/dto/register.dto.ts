import { IsEmail, IsNotEmpty } from "class-validator";
import { UserRole } from "src/generated/prisma/enums";

export class RegisterDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsNotEmpty()
    password: string;

    @IsNotEmpty()
    conformPassword: string;

    @IsNotEmpty()
    role?: UserRole;

    fullName?: string;
}