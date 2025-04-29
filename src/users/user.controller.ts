/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Controller,
  Get,
  Delete,
  Param,
  Query,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { Types, FilterQuery } from 'mongoose';
import { UserService } from './user.service';
import { User } from './user.shemas';
import { AllowAny } from 'src/auth/auth.decorator';

interface GetUserQuery {
  email?: string;
  page?: number;
  limit?: number;
}

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @AllowAny()
  @Get(':id')
  async getUser(@Param('id') id: string) {
    try {
      const userId = new Types.ObjectId(id);
      const user = await this.userService.findOne(userId);
      const { password, __v, ...userObject } = user.toObject();
      return userObject;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    try {
      const userId = new Types.ObjectId(id);
      await this.userService.remove(userId);
      return { message: 'User successfully deleted' };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @AllowAny()
  @Get('all')
  async getUsers(@Query() query: GetUserQuery) {
    try {
      const { email, page = 1, limit = 1000 } = query;
      const filters: FilterQuery<User> = {};
      if (email) filters.email = { $regex: email, $options: 'i' };
      return this.userService.findAll({
        filters,
        page,
        limit,
        order: 1,
        sortField: 'email',
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
