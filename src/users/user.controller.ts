/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  All,
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { AllowAny, LoggedInUserDecorator } from 'src/auth/auth.decorator';
import { NotFoundError } from 'rxjs';
import { FilterQuery, Types } from 'mongoose';
import { User, UserDocument } from './user.schema';
import { UpdateProfileDto } from 'src/common/dtos';

interface GetUserQuey {
  email?: string;
  page?: number;
  limit?: number;
}

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @AllowAny()
  @Get(':id')
  async getUser(@Param() id: string) {
    try {
      const userId = new Types.ObjectId(id);
      const user = (await this.userService.findOne(userId)) as any;
      const { password, lastAuthChange, __v, ...userObject } = user.toObject();
      return userObject;
    } catch (error) {
      if (error instanceof NotFoundError)
        throw new NotFoundException(error.message, error.name);
      throw new BadRequestException(error.message);
    }
  }

  @Delete()
  async deleteUser(@LoggedInUserDecorator() user: UserDocument) {
    const result = await this.userService.remove(user);
    return {
      message: 'User Deleted Successfully',
      user: result,
    };
  }

  @AllowAny()
  @Get('all')
  async getUsers(@Query() query: GetUserQuey) {
    try {
      const { email, page = 1, limit = 1000 } = query;
      const filters: FilterQuery<User> = {};
      if (email) filters.email = { $regex: email, $options: 'i' };
      const users = await this.userService.findAll({
        filters,
        page,
        limit,
        order: 1,
        sortField: 'email',
      });
      return users;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get('/')
  async getCurrentUser(@LoggedInUserDecorator() user: UserDocument) {
    return await this.userService.findOne(user._id);
  }

  @Patch('profile')
  async updateProfile(
    @Body() payload: UpdateProfileDto,
    @LoggedInUserDecorator() user: UserDocument,
  ) {
    const result = await this.userService.updateProfile(
      user._id.toString(),
      payload,
    );
    return {
      message: 'User Deleted Successfully',
      user: result,
    };
  }
}
