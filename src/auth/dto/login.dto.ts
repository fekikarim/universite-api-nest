import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

// Swagger decorators
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ description: 'Email de l\'utilisateur', example: 'student123@example.tn' })
  @IsNotEmpty() @IsEmail() email: string;

  @ApiProperty({ description: 'Mot de passe de l\'utilisateur', example: 'student123', minLength: 3 })
  @IsNotEmpty() @MinLength(3) password: string;
}
