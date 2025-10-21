import { IsString, IsNotEmpty } from 'class-validator';

export class CreateOptionDto {
    
    @IsNotEmpty()
    @IsString()
    name: string;
    
}
