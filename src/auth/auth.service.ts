/* eslint-disable @typescript-eslint/no-unused-vars */

/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import { BadRequestException, Injectable } from '@nestjs/common';
import { verifyPassword } from 'libs/utils/src/util.encrypt';
import { UserDto } from 'src/common/dtos';
import { UserService } from 'src/users/user.service';
import { JwtService } from '@nestjs/jwt';
import { JWT_SECRET } from 'libs/utils/src/util.constants';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async register(payload: UserDto) {
    const user = await this.userService.createUser(payload);
    return user;
  }

  async login(payload: UserDto) {
    const { email, password } = payload;

    const user = await this.userService.getUserByEmailIncludePassword(email);

    if (!user) {
      throw new BadRequestException('Invalid Credential');
    }

    const passwordMatch = verifyPassword(password, user.password);

    if (!passwordMatch) {
      throw new BadRequestException('Incorrect Password');
    }
    const token = this.jwtService.sign(
      { _id: user._id.toString() },
      {
        secret: JWT_SECRET.toString(),
      },
    );

    delete user['_doc'].password;

    return {
      ...user['_doc'],
      accessToken: token,
    };
  }
}
