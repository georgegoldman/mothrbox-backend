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
import {
  JWT_SECRET,
  nonceRateLimitMax,
  nonceRateLimitWindow,
} from 'src/config/utils/src/util.constants';
import BaseError, { UnauthorizedError } from 'src/config/utils/src/util.errors';
import { CacheHelperUtil } from 'src/config/utils/src/util.redis';

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

  async generateWalletAuthNonce(walletAddress: string) {
    try {
      // Check rate limiting.
      const rateLimitKey =
        CacheHelperUtil.cacheKeys.walletNonceRateLimit(walletAddress);
      console.log('Rate limit key:', rateLimitKey);
      let currentRequests =
        await CacheHelperUtil.getCache<number>(rateLimitKey);
      const ttl = await CacheHelperUtil.getTtl(rateLimitKey);
      console.log('Rate limit key:', currentRequests);

      if (currentRequests && ttl <= 0) {
        await CacheHelperUtil.removeFromCache(rateLimitKey);
        currentRequests = 0;
      }

      if (currentRequests && currentRequests >= nonceRateLimitMax) {
        throw new BaseError(
          `Too many requests. Please try again in ${Math.ceil(ttl || 0)} seconds.`,
          429,
        );
      }

      // Generate a nonce
      const nonce = generateSecret();
      console.log('Rate limit key:', nonce);

      const message = createSignatureMessage(walletAddress, nonce);
      console.log('Rate limit key:', message);

      // Store nonce in Redis with expiration
      const nonceKey = CacheHelperUtil.cacheKeys.walletNonce(walletAddress);
      console.log('Rate limit key:', nonceKey);

      await CacheHelperUtil.setCache(nonceKey, nonce, nonceRateLimitWindow);

      // Update rate limiting (preserve existing window)
      const newRateLimit = currentRequests ? currentRequests + 1 : 1;
      console.log('Rate limit key:', newRateLimit);

      const newTtl = !currentRequests ? nonceRateLimitWindow : ttl;
      console.log('Rate limit key:', newTtl);

      await CacheHelperUtil.setCache(rateLimitKey, newRateLimit, newTtl);

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
    // Verify nonce exists and hasn't expired
    const nonceKey = CacheHelperUtil.cacheKeys.walletNonce(
      payload.walletAddress,
    );
    const storedNonce = await CacheHelperUtil.getCache<string>(nonceKey);

    // TODO: ENABLE NONCE CHECKING
    if (!storedNonce) {
      throw new UnauthorizedError(
        'Invalid or expired nonce. Please request a new one.',
        401,
      );
    }

    if (storedNonce !== payload.nonce) {
      throw new UnauthorizedError('Invalid nonce.', 401);
    }

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

    // Remove the used nonce immediately
    await CacheHelperUtil.removeFromCache(nonceKey);

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

    // Generate JWT token
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
