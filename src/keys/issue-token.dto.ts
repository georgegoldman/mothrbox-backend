import { IsString } from 'class-validator';

export class KeyPairDTO {
  @IsString()
  address: string;
}

export class IssueTokenResponseDto {
  token: string;
}
