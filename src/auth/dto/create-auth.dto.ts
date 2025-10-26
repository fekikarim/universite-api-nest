import { IsEmail, IsNotEmpty, IsString, MinLength, IsInt, Min, IsOptional, IsIn } from 'class-validator';
import { Type } from "class-transformer";

// Swagger decorators
import { ApiProperty } from '@nestjs/swagger';
import { Role } from 'src/utilisateurs/schemas/utilisateur/utilisateur';

// prosit 4 
export class CreateAuthDto {
  @ApiProperty({ description: 'Prénom de l\'utilisateur', example: 'John' })
  @IsNotEmpty() @IsString() firstName: string;

  @ApiProperty({ description: 'Nom de l\'utilisateur', example: 'Doe' })
  @IsNotEmpty() @IsString() lastName: string;

  @ApiProperty({ description: 'ID étudiant', example: '123456' })
  @IsNotEmpty() @IsString() studentId: string;

  @ApiProperty({ description: 'Email de l\'utilisateur', example: 'student123@example.tn' })
  @IsNotEmpty() @IsEmail() email: string;

  @ApiProperty({ description: 'Âge de l\'utilisateur', example: 20, minimum: 0 })
  @IsNotEmpty() @IsInt() @Min(0) @Type(() => Number) age: number;

  @ApiProperty({ description: 'Avatar de l\'utilisateur', example: 'avatar.png', required: false })
  @IsOptional() @IsString() avatar: string;

  @ApiProperty({ description: 'Mot de passe de l\'utilisateur', example: 'password123', minLength: 6 })
  @IsNotEmpty() @MinLength(6) password: string;

  @ApiProperty({ description: 'Rôle de l\'utilisateur', example: Role.ETUDIANT, enum: Role })
  @IsNotEmpty() @IsString() @IsIn(['ADMIN', 'ETUDIANT']) role: string;
}
