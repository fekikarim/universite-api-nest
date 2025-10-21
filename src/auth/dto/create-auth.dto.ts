import { IsEmail, IsNotEmpty, IsString, MinLength, IsInt, Min, IsOptional, IsIn } from 'class-validator';
import { Type } from "class-transformer";

// prosit 4 
export class CreateAuthDto {
  @IsNotEmpty() @IsString() firstName: string;
  @IsNotEmpty() @IsString() lastName: string;

  @IsNotEmpty() @IsString() studentId: string;

  @IsNotEmpty() @IsEmail() email: string;

  @IsNotEmpty() @IsInt() @Min(0) @Type(() => Number) age: number;   

  @IsOptional() @IsString() avatar: string;     

  @IsNotEmpty() @MinLength(6) password: string;

  @IsNotEmpty() @IsString() @IsIn(['ADMIN', 'ETUDIANT']) role: string;
}
