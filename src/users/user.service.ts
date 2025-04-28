/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './user.shemas';
import { FilterQuery, Model, SortOrder, Types } from 'mongoose';
import { encryptPassword } from 'libs/utils/src/util.encrypt';
import { IntegrityError, NotFoundError } from 'libs/utils/src/util.errors';
import { paginate, PaginatedDoc } from 'libs/utils/src/util.pagination';

interface UserParams {
  email: string;
  password: string;
}

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async createUser({ email, password }: UserParams): Promise<UserDocument> {
    try {
      const user = await this.userModel.create({
        email,
        password: encryptPassword(password),
      });
      return user;
    } catch (error) {
      if (error && error?.code === 11000) {
        throw new IntegrityError('Email already exists');
      }
      throw error;
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
}
