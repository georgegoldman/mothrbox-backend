// src/common/dtos/index.ts
import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UploadFileDto {
  recipientPublicKey: string;
  fileContent?: string;
  metadata?: Record<string, any>;
}

export class EncryptedResponseDto {
  encryptedData: string;
  ephemeralPublicKey: string;
}

export class DecryptFileDto {
  @IsString()
  @IsNotEmpty()
  encryptedData: string;

  @IsString()
  @IsNotEmpty()
  fileId: string;
}

export class WalletLoginDto {
  @IsNotEmpty({ message: 'Wallet address is required' })
  walletAddress: string;

  @IsString()
  @IsNotEmpty({ message: 'Signature is required' })
  signature: string;

  @IsString()
  nonce: string;
}

export class LoginDto {
  @IsOptional()
  @IsEmail()
  email: string;

  @IsOptional()
  @IsPhoneNumber(undefined, { message: 'Please enter a valid phone number' })
  phone: string;

  @IsString()
  password: string;
}

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  username: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @IsPhoneNumber(undefined, { message: 'Please enter a valid phone number' })
  phone: string;

  @IsString()
  @MinLength(4)
  @MaxLength(20)
  password: string;
}

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  username: string;

  @IsOptional()
  @IsString()
  @IsPhoneNumber()
  phone: string;

  @IsOptional()
  @IsString()
  @IsEmail()
  email: string;
}

export class VerifyEmailDto {
  @IsEmail()
  email: string;

  @IsNumber()
  code: number;
}

export class VerifyPhoneNumberDto {
  @IsPhoneNumber()
  phone: string;

  @IsNumber()
  code: number;
}

export class RequestVerifyEmailOtpDto {
  @IsEmail()
  email: string;
}

export class ForgotPasswordDto {
  @IsEmail()
  email: string;
}

export class ResetPasswordDto extends LoginDto {
  @IsNumber()
  code: number;

  @IsString()
  confirmPassword: string;
}
