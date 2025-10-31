import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { DataController } from './data.controller';
import { DataService } from './data.service';

@Module({
  imports: [HttpModule],
  controllers: [DataController],
  providers: [DataService],
})
export class DataModule {}