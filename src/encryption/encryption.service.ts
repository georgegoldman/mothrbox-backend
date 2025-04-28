/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { UploadFileDto, EncryptedResponseDto } from '../common/dtos';

@Injectable()
export class EncryptionService {
  constructor(private readonly httpService: HttpService) {}

  async encryptFile(data: UploadFileDto): Promise<EncryptedResponseDto> {
    const response = await this.httpService.axiosRef.post(
      'http://localhost:9000/encrypt',
      data,
    );
    return response.data;
  }
}
