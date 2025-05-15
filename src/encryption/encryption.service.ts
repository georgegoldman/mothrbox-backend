/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { UploadFileDto, EncryptedResponseDto } from '../common/dtos';
import { decode } from '@msgpack/msgpack';
import { MOTHRBOX_BASE_URL } from 'src/config/utils/src/util.constants';
import axios from 'axios';
import { UserDocument } from 'src/users/user.shemas';

@Injectable()
export class EncryptionService {
  constructor(private readonly httpService: HttpService) {}

  async encryptFile(
    user: UserDocument,
    payload: UploadFileDto,
  ): Promise<EncryptedResponseDto> {
    try {
      const response = await this.httpService.axiosRef.post(
        `${MOTHRBOX_BASE_URL}/encrypt_file}`,
        {
          userId: user._id,
          ...payload,
        },
        {
          responseType: 'arraybuffer',
          headers: {
            Accept: 'application/msgpack',
          },
        },
      );
      const decoded = decode(
        new Uint8Array(response.data),
      ) as EncryptedResponseDto;

      return decoded;
    } catch (error: unknown) {
      console.error('Encryption error details:', error);
      if (axios.isAxiosError(error)) {
        console.error('Axios error response:', error.response?.data);
        throw new Error(`Encryption failed: ${error.message}`);
      }
      if (error instanceof Error) {
        throw new Error(`Encryption failed: ${error.message}`);
      }
      throw new Error();
    }
  }

  async getEncryptedFileById(fileId: string): Promise<EncryptedResponseDto> {
    try {
      const response = await this.httpService.axiosRef.get(
        `${MOTHRBOX_BASE_URL}/encrypt_file/${fileId}`,
        {
          responseType: 'arraybuffer',
          headers: {
            Accept: 'application/msgpack',
          },
        },
      );

      const decoded = decode(
        new Uint8Array(response.data),
      ) as EncryptedResponseDto;

      return decoded;
    } catch (error: unknown) {
      console.error('Fetching encrypted file failed:', error);
      if (axios.isAxiosError(error)) {
        console.error('Axios error response:', error.response?.data);
        throw new Error(`Fetch failed: ${error.message}`);
      }
      throw new Error('Unknown error fetching encrypted file');
    }
  }
}
