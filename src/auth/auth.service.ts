/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import {
  createSignatureMessage,
  encryptPassword,
  generateSecret,
  verifyPassword,
  verifyWalletSignature,
} from 'src/config/utils/src/util.encrypt';
import {
  CreateUserDto,
  ForgotPasswordDto,
  LoginDto,
  RequestVerifyEmailOtpDto,
  ResetPasswordDto,
  VerifyEmailDto,
  VerifyPhoneNumberDto,
  WalletLoginDto,
} from 'src/common/dtos';
import { UserService } from 'src/users/user.service';
import { JwtService } from '@nestjs/jwt';
import { APP_NAME, JWT_SECRET } from 'src/config/utils/src/util.constants';
import BaseError, {
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from 'src/config/utils/src/util.errors';
import { OtpService } from 'src/otp/services/otp.service';
import { OtpTypeEnum } from 'src/common/enums';
import { welcomeEmailTemplate } from 'src/mail/templates/welcome.email';
import { UserDocument } from 'src/users/user.shemas';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private otpService: OtpService,
    private mailService: MailService,
  ) {}

  async register(payload: CreateUserDto) {
    const user = await this.userService.createUser(payload);

    // await this.otpService.sendOTP({
    //   email: user.email,
    //   type: OtpTypeEnum.VERIFY_EMAIL,
    // });

    return user;
  }

  async login(payload: LoginDto) {
    try {
      const { email, phone, password } = payload;

      if (!email && !phone) {
        throw new ValidationError('Email or phone is required');
      }

      let user;
      if (email) {
        user = await this.userService.getUserDetailsWithPassword({ email });
      } else if (phone) {
        user = await this.userService.getUserDetailsWithPassword({ phone });
      }

      if (!user) {
        throw new NotFoundError('Invalid Credential');
      }

      const passwordMatch = verifyPassword(password, user.password);

      if (!passwordMatch) {
        throw new ValidationError('Incorrect Password');
      }

      // if (!user.emailVerified) {
      //   throw new ValidationError('kindly verify your email to login');
      // }

      const token = this.jwtService.sign(
        { _id: user._id as string },
        {
          secret: JWT_SECRET,
        },
      );

      delete user['_doc'].password;

      return {
        ...user['_doc'],
        accessToken: token,
      };
    } catch (error) {
      if (error instanceof BaseError) {
        throw error;
      } else {
        throw new BaseError(error?.message || 'Login failed');
      }
    }
  }

  async verifyEmail(payload: VerifyEmailDto) {
    const { code, email } = payload;

    const user = await this.userService.getUserByEmail(email);

    if (!user) {
      throw new BadRequestException('Invalid Email');
    }

    if (user.emailVerified) {
      throw new UnprocessableEntityException('Email already verified');
    }

    await this.otpService.verifyOTP(
      {
        code,
        email,
        type: OtpTypeEnum.VERIFY_EMAIL,
      },
      true,
    );

    await this.userService.updateQuery(
      { email },
      {
        emailVerified: true,
      },
    );

    const welcomeEmailName = user?.username || 'User';
    await this.mailService.sendEmail(
      user.email,
      `Welcome To ${APP_NAME}`,
      welcomeEmailTemplate({
        name: welcomeEmailName,
      }),
    );
  }

  async verifyPhoneNumber(user: UserDocument, payload: VerifyPhoneNumberDto) {
    const { phone, code } = payload;

    if (user.phoneNumberVerified) {
      throw new UnprocessableEntityException('Phone number already verified');
    }

    await this.otpService.verifyOTP(
      {
        code,
        type: OtpTypeEnum.VERIFY_PHONE,
      },
      true,
    );

    await this.userService.updateQuery(
      { phone },
      {
        phoneNumberVerified: true,
      },
    );
  }

  async sendVerificationMail(payload: RequestVerifyEmailOtpDto) {
    await this.userService.checkUserExistByEmail(payload.email);

    await this.otpService.sendOTP({
      ...payload,
      type: OtpTypeEnum.VERIFY_EMAIL,
    });
  }

  async sendPasswordResetEmail(payload: ForgotPasswordDto) {
    await this.userService.checkUserExistByEmail(payload.email);

    await this.otpService.sendOTP({
      ...payload,
      type: OtpTypeEnum.RESET_PASSWORD,
    });
  }

  async resetPassword(payload: ResetPasswordDto) {
    const { email, password, confirmPassword, code } = payload;

    if (password !== confirmPassword) {
      throw new ConflictException('Passwords do not match');
    }

    await this.otpService.verifyOTP(
      {
        email,
        code,
        type: OtpTypeEnum.RESET_PASSWORD,
      },
      true,
    );

    const hashedPassword = encryptPassword(password);
    await this.userService.updateQuery({ email }, { password: hashedPassword });
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
      throw new BaseError('Failed to generate wallet nonce');
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
