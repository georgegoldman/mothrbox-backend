import { IsString } from 'class-validator';

export class GenerateKeyPairRequestDto {
  @IsString()
  owner: string;

  @IsString()
  algorithm: string;

  @IsString()
  alias: string;
}

export class KeyPairResponseDto {
  status: number;
  message: string;
}
