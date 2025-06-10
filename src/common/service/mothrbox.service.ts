/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { HttpService } from '@nestjs/axios';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { MOTHRBOX_BASE_URL } from 'src/config/utils/src/util.constants';
import * as FormData from 'form-data';
import { decode } from '@msgpack/msgpack';

@Injectable()
export class MothrboxService {
  constructor(private readonly httpService: HttpService) {}
  async proxyBinaryCall(
    operation: 'encrypt' | 'decrypt',
    userId: string,
    alias: string,
    buffer: Buffer,
    walletAddress: string,
    filename: string,
    blobId?: string,
  ): Promise<any> {
    try {
      const form = new FormData();
      form.append('owner', walletAddress);
      form.append('file', buffer, {
        filename,
        contentType: 'application/octet-stream',
      });
      const response = await this.httpService.axiosRef.post(
        `${MOTHRBOX_BASE_URL}/${operation}/${userId}/${alias}`,
        form,
        {
          headers: {
            ...form.getHeaders(), // automatically sets 'Content-Type: multipart/form-data; boundary=...'
            Accept: 'application/msgpack',
          },
          responseType: 'arraybuffer',
          timeout: 0,
        },
      );
      // const decoded = decode(Buffer.from(response.data));
      return response.data;
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

  async proxyFetchAndDecrypt(
    userId: string,
    alias: string,
    blobId: string,
  ): Promise<Buffer> {
    try {
      const url = `${MOTHRBOX_BASE_URL}/decrypt/${userId}/${alias}/${blobId}`;

      const response = await this.httpService.axiosRef.get(url, {
        headers: {
          Accept: 'application/msgpack',
        },
        responseType: 'arraybuffer',
        timeout: 0,
      });

      return Buffer.from(response.data);
    } catch (error) {
      console.error('Decryption error:', {
        message: error.message,
        stack: error.stack,
        response: error.response?.data,
        status: error.response?.status,
      });
      throw new InternalServerErrorException('Decryption failed via Mothrbox');
    }
  }
}
