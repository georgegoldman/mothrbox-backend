/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './user.schema';
import {
  ClientSession,
  FilterQuery,
  Model,
  SortOrder,
  Types,
  UpdateQuery,
} from 'mongoose';
import { encryptPassword } from 'src/config/utils/src/util.encrypt';
import {
  IntegrityError,
  NotFoundError,
} from 'src/config/utils/src/util.errors';
import { paginate, PaginatedDoc } from 'src/config/utils/src/util.pagination';
import { CreateUserDto, UpdateProfileDto } from 'src/common/dtos';
import { JWT_SECRET } from 'src/config/utils/src/util.constants';
import { JwtService } from '@nestjs/jwt';

interface UserParams {
  email: string;
  password: string;
}

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly jwtService: JwtService,
  ) {}

  async createUser(payload: CreateUserDto): Promise<UserDocument> {
    try {
      if (!payload.email && !payload.phone) {
        throw new BadRequestException('Either email or phone is required');
      }

      const [userWithEmailExists, userWithPhoneExists] = await Promise.all([
        this.userModel.exists({ email: payload.email }),
        payload.phone ? this.userModel.exists({ phone: payload.phone }) : null,
      ]);

      if (userWithEmailExists) {
        throw new BadRequestException('User with this email already exists');
      }

      if (userWithPhoneExists) {
        throw new BadRequestException('User with this phone already exists');
      }
      const hashedPassword = encryptPassword(payload.password);

      const createdUser = await this.userModel.create({
        ...payload,
        password: hashedPassword,
      });

      const token = this.jwtService.sign(
        { _id: createdUser._id.toString() },
        {
          secret: JWT_SECRET,
        },
      );

      delete createdUser['_doc'].password;

      return {
        ...createdUser['_doc'],
        accessToken: token,
      } as UserDocument;
    } catch (e) {
      console.error('Error while creating user', e);
      if (e.code === 11000) {
        const keys = Object.keys(e.keyValue).join(', ');
        throw new IntegrityError(`${keys} already exists`);
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

  async remove(user: UserDocument) {
    return await this.userModel.findOneAndDelete(user._id);
  }

  async getUserDetailsWithPassword(
    query: FilterQuery<User>,
  ): Promise<UserDocument | null> {
    return this.userModel.findOne(query).select('+password');
  }

  async findOneAndUpdate(filter: any, update: any, options?: any) {
    return this.userModel
      .findOneAndUpdate(filter, update, { new: true, ...options })
      .exec();
  }

  async updateProfile(userId: string, payload: UpdateProfileDto) {
    const { username, email, phone } = payload;

    if (username) {
      const userWithUsernameExist = await this.userModel.findOne({
        username,
        _id: { $ne: userId },
      });

      if (userWithUsernameExist) {
        throw new IntegrityError('Username already used, try another name');
      }
    }

    if (email) {
      const userWithEmailExist = await this.userModel.findOne({
        email,
        _id: { $ne: userId },
      });

      if (userWithEmailExist) {
        throw new IntegrityError('email already used, try another name');
      }
    }

    if (phone) {
      const userWithPhoneExist = await this.userModel.findOne({
        phone,
        _id: { $ne: userId },
      });

      if (userWithPhoneExist) {
        throw new IntegrityError('phone number already used, try another name');
      }
    }

    return await this.userModel.findByIdAndUpdate(
      userId,
      { ...payload },
      {
        new: true,
      },
    );
  }

  async getUserByEmail(
    email: string,
    populateFields?: string | string[],
  ): Promise<UserDocument> {
    const user = await this.userModel
      .findOne({ email })
      .populate(populateFields || []);
    if (!user) throw new NotFoundError('User not found');
    return user;
  }

  async updateQuery(
    query: FilterQuery<User>,
    update: UpdateQuery<User>,
    session?: ClientSession,
  ) {
    return await this.userModel.updateOne(query, update, {
      session,
      new: true,
    });
  }

  async findOneQuery({
    options,
    showDeleted = false,
    session,
  }: {
    options: FilterQuery<User>;
    showDeleted?: boolean;
    session?: ClientSession;
  }): Promise<User | null> {
    return await this.userModel
      .findOne({
        ...options,
        isDeleted: showDeleted
          ? { $in: [showDeleted, false, undefined] }
          : { $in: [false, undefined] },
      })
      .session(session || null);
  }

  async checkUserExistByEmail(email: string): Promise<boolean> {
    const user = await this.getUserByEmail(email);

    if (!user) {
      throw new NotFoundError('No user exist with provided email');
    }

    return true;
  }
}
