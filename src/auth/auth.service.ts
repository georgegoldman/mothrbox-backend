/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  createSignatureMessage,
  generateSecret,
  verifyPassword,
  verifyWalletSignature,
} from 'src/config/utils/src/util.encrypt';
import { UserDto, WalletLoginDto } from 'src/common/dtos';
import { UserService } from 'src/users/user.service';
import { JwtService } from '@nestjs/jwt';
import { JWT_SECRET } from 'src/config/utils/src/util.constants';
import { UnauthorizedError } from 'src/config/utils/src/util.errors';

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
    try {
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
        { _id: user._id },
        {
          secret: JWT_SECRET,
          algorithm: 'HS256',
        },
      );

      delete user['_doc'].password;

      return {
        ...user['_doc'],
        accessToken: token,
      };
    } catch (error) {
      throw new BadRequestException(error?.message || 'Login failed');
    }
  }

  generateWalletAuthNonce(walletAddress: string) {
    try {
      // Generate a nonce
      const nonce = generateSecret();
      console.log('Rate limit key:', nonce);

      const message = createSignatureMessage(walletAddress, nonce);

      return {
        nonce,
        message,
      };
    } catch (error) {
      console.error('Error generating wallet auth nonce:', error);
      throw new InternalServerErrorException('Failed to generate wallet nonce');
    }
  }

  async loginWithWallet(payload: WalletLoginDto) {
    // Recreate the message that was signed
    const message = createSignatureMessage(
      payload.walletAddress,
      payload.nonce,
    );

    // Verify signature
    const isValidSignature = verifyWalletSignature(
      message,
      payload.signature,
      payload.walletAddress,
    );

    if (!isValidSignature) {
      throw new UnauthorizedError('Invalid wallet signature.', 401);
    }

    const now = new Date();
    const result = await this.userService.findOneAndUpdate(
      {
        walletAddress: payload.walletAddress,
      },
      {
        $setOnInsert: {
          walletAddress: payload.walletAddress,
        },
        $set: {
          lastLoginAt: now,
        },
      },
      {
        upsert: true,
        new: true,
        rawResult: true,
      },
    );

    // Extract the user document from the result
    const user = result.value;

    if (!user) {
      throw new UnauthorizedError('Failed to create or find user', 401);
    }

    const token = this.jwtService.sign({
      _id: user._id,
    });

    return {
      token,
      user: {
        _id: user._id,
        walletAddress: user.walletAddress,
      },
    };
  }
}
