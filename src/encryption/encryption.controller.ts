import { Controller, Param, Post, Req, Res } from '@nestjs/common';
import { EncryptionService } from './encryption.service';
import { FastifyReply, FastifyRequest } from 'fastify';

@Controller('encrypt')
export class EncryptionController {
  constructor(private encryptionService: EncryptionService) {}

  @Post(':_id')
  async encrypt(
    @Req() req: FastifyRequest,
    @Res() reply: FastifyReply,
    @Param('_id') _id: string,
  ) {
    return await this.encryptionService.encrypt(req, reply, _id);
  }
}
