import { IsString } from 'class-validator';

export class GenerateKeyPairRequestDto {
  @IsString()
  user: string;

  @IsString()
  algorithm: string;
}

export class KeyPairResponseDto {
  status: number;
  message: string;
}
