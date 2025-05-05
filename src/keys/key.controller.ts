import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { KeyService } from './key.service';
import { GenerateKeyPairRequestDto, KeyPairResponseDto } from './key.dto';

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
}
