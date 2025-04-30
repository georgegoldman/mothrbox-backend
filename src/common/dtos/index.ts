// src/common/dtos/index.ts
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
export class UploadFileDto {
  userId: string;
  recipientPublicKey: string;
  fileContent: string;
  metadata?: Record<string, any>;
}

export class EncryptedResponseDto {
  encryptedData: string;
  ephemeralPublicKey: string;
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

  @IsOptional()
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  @IsPhoneNumber(undefined, { message: 'Please enter a valid phone number' })
  phone: string;

  @IsString()
  @MinLength(4)
  @MaxLength(20)
  password: string;
}
