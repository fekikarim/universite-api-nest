import { Controller, Get, Query, HttpException, HttpStatus } from '@nestjs/common';
import { DataService } from './data.service';

@Controller('data')
export class DataController {
  constructor(private readonly dataService: DataService) {}

  @Get()
  async getData(@Query('type') type?: string) {
    try {
      switch (type) {
        case 'users':
          return await this.dataService.getUsers();
        case 'posts':
          return await this.dataService.getPosts();
        case 'todos':
          return await this.dataService.getTodos();
        default:
          return await this.dataService.getUsers(); // Default to users
      }
    } catch (error) {
      throw new HttpException(
        'Failed to fetch data from external API',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}