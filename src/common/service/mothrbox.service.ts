/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { HttpService } from '@nestjs/axios';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { MOTHRBOX_BASE_URL } from 'src/config/utils/src/util.constants';

@Injectable()
export class MothrboxService {
  constructor(private readonly httpService: HttpService) {}
  async proxyBinaryCall(
    operation: 'encrypt' | 'decrypt',
    userId: string,
    alias: string,
    buffer: Buffer,
  ): Promise<Buffer> {
    try {
      const response = await this.httpService.axiosRef.post(
        `${MOTHRBOX_BASE_URL}/${operation}/${userId}/${alias}`,
        buffer,
        {
          headers: {
            'Content-Type': 'application/octet-stream',
            Accept: 'application/msgpack',
          },
          responseType: 'arraybuffer',
          timeout: 30000,
        },
      );
      return Buffer.from(response.data);
    } catch (error) {
      console.error(`Mothrbox ${operation} error:`, {
        message: error.message,
        stack: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      throw new InternalServerErrorException('Encryption failed via Mothrbox');
    }
  }
}
