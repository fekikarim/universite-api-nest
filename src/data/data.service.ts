import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class DataService {
  private readonly baseUrl = 'https://jsonplaceholder.typicode.com';

  constructor(private readonly httpService: HttpService) {}

  async getUsers() {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/users`)
      );
      return {
        success: true,
        data: response.data,
        source: 'JSONPlaceholder API - Users',
      };
    } catch (error) {
      throw new HttpException(
        'Failed to fetch users',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getPosts() {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/posts`)
      );
      return {
        success: true,
        data: response.data,
        source: 'JSONPlaceholder API - Posts',
      };
    } catch (error) {
      throw new HttpException(
        'Failed to fetch posts',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getTodos() {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/todos`)
      );
      return {
        success: true,
        data: response.data,
        source: 'JSONPlaceholder API - Todos',
      };
    } catch (error) {
      throw new HttpException(
        'Failed to fetch todos',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}