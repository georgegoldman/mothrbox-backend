// src/common/dtos/index.ts
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
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

export class UserDto {
  @IsNotEmpty()
  @IsEmail()
  @IsString()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;
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
