import { PartialType } from '@nestjs/swagger';
import { CreateDatumDto } from './create-datum.dto';

export class UpdateDatumDto extends PartialType(CreateDatumDto) {}
