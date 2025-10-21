import { Type } from "class-transformer";
import { IsEmail, IsNotEmpty, IsInt, Min, IsString, IsOptional, IsIn } from "class-validator";

export class CreateUtilisateurDto {
    @IsNotEmpty()
    @IsString()
    firstName: string;

    @IsNotEmpty()
    @IsString()
    lastName: string;

    @IsNotEmpty()
    @IsString()
    studentId: string;

    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @IsInt()
    @Min(0)
    @Type(() => Number)
    age: number;

    // prosit 3 new fields
    @IsOptional()
    @IsString()
    avatar: string;

    // prosit 4 new fields
    @IsNotEmpty()
    @IsString()
    password: string;

    @IsNotEmpty()
    @IsString()
    @IsIn(['ADMIN', 'ETUDIANT'])
    role: string;
}
