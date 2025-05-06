/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
} from '@nestjs/common';
import { KeyService } from './key.service';
import { GenerateKeyPairRequestDto, KeyPairResponseDto } from './key.dto';
import { KeyPairDTO } from './issue-token.dto';

@Controller('keys')
export class KeyController {
  constructor(private readonly keyService: KeyService) {}

  @Post('generate')
  @HttpCode(HttpStatus.OK)
  async generateKeyPair(
    @Body() request: GenerateKeyPairRequestDto,
  ): Promise<KeyPairResponseDto> {
    return this.keyService.generateKeyPair(request);
  }

  @Post('issue')
  async issueToken(@Body() payload: KeyPairDTO): Promise<{ token: string }> {
    const token = await this.keyService.issueToken(payload);
    return { token };
  }

  @Get()
  async getKeypairs() {
    return this.keyService.getAllKeypairs();
  }

  @Get('walrus')
  async confirm() {
    return this.keyService.testWalrus();
  }
}
