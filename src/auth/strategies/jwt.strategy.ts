/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

/* eslint-disable @typescript-eslint/no-unsafe-call */
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { UserService } from 'src/users/user.service';
import {
  UnauthorizedError,
  ValidationError,
} from 'src/config/utils/src/util.errors';
import { TokenExpiredError } from '@nestjs/jwt';
import { config } from 'dotenv';
import { JWT_SECRET } from 'src/config/utils/src/util.constants';
config();

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private userService: UserService) {
    super({
      passReqToCallback: true,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: JWT_SECRET,
    });
  }

  async validate(
    req: Request,
    payload: Partial<{ _id: string; publicKey?: string }>,
  ) {
    let errorMessage = 'Invalid auth token, please login again.';
    let isError = false;

    try {
      const { _id } = payload;

      if (!_id) {
        throw new UnauthorizedException('Invalid token payload');
      }

      const user = await this.userService.findOne(_id as any);

      if (!user) {
        errorMessage = 'Invalid auth token, please login again.';
        isError = true;
      }

      // if (user && !user?.emailVerified) {
      //   errorMessage = 'Please verify your email to continue.';
      //   isError = true;
      // }

      if (isError) {
        throw new UnauthorizedError(errorMessage, HttpStatus.UNAUTHORIZED);
      }

      return user;
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new ValidationError(
          'Session expired, login again.',
          HttpStatus.UNAUTHORIZED,
        );
      } else {
        throw new UnauthorizedException('Session expired.');
      }
    }
  }
}
