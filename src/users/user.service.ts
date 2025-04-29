/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './user.shemas';
import { FilterQuery, Model, SortOrder, Types } from 'mongoose';
import { encryptPassword } from 'src/config/utils/src/util.encrypt';
import {
  IntegrityError,
  NotFoundError,
} from 'src/config/utils/src/util.errors';
import { paginate, PaginatedDoc } from 'src/config/utils/src/util.pagination';
import { UserDto } from 'src/common/dtos';

interface UserParams {
  email: string;
  password: string;
}

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async createUser(payload: UserDto): Promise<UserDocument> {
    try {
      const [userWithEmailExists] = await Promise.all([
        this.userModel.exists({ email: payload.email }),
      ]);

      if (userWithEmailExists) {
        throw new BadRequestException('User with this email already exists');
      }

      const hashedPassword = encryptPassword(payload.password);

      const createdUser = await this.userModel.create({
        ...payload,
        password: hashedPassword,
      });

      delete createdUser['_doc'].password;
      return createdUser;
    } catch (e) {
      console.error('Error while creating user', e);
      if (e.code === 11000) {
        throw new IntegrityError(`${Object.keys(e.keyValue)} already exists`);
      } else {
        throw new InternalServerErrorException(
          e.response?.message || 'Something went wrong',
        );
      }
    }
  }

  async findAll({
    filters = {},
    page = 1,
    limit = 10,
    order = -1,
    sortField = 'email',
  }: {
    filters: FilterQuery<User>;
    page: number;
    limit: number;
    order: SortOrder;
    sortField: string;
  }): Promise<PaginatedDoc<User>> {
    const fieldsToExclude = ['-password', '-lastAuthChange', '-__v'];
    return await paginate(
      this.userModel,
      filters,
      { page, limit, sortField, sortOrder: order },
      fieldsToExclude,
    );
  }

  /**
   *
   * @param id
   * @param query
   * @returns
   */
  async findOne(
    id: Types.ObjectId | null,
    query: any = {},
  ): Promise<UserDocument> {
    if (id) {
      query._id = id;
    }
    const user = await this.userModel.findOne(query);
    if (user == null) throw new NotFoundError('User not found');
    return user;
  }

  async update(
    id: Types.ObjectId,
    { email }: Partial<UserParams>,
  ): Promise<User> {
    const updateData: any = {}; // partial <userParams>
    if (email) updateData.email = email;
    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .lean()
      .exec();
    if (!updatedUser) {
      throw new NotFoundError('User not found');
    }
    return updatedUser;
  }

  async remove(id: Types.ObjectId): Promise<UserDocument> {
    const user = await this.userModel.findOneAndDelete({ _id: id });
    if (user == null) throw new NotFoundError('user not found');
    return user;
  }

  async getUserByEmailIncludePassword(
    email: string,
  ): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).select('+password');
  }

  async findOneAndUpdate(filter: any, update: any, options?: any) {
    return this.userModel
      .findOneAndUpdate(filter, update, { new: true, ...options })
      .exec();
  }
}
