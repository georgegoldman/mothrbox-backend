/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Key } from './key.schema';
import axios from 'axios';
import { MOTHRBOX_BASE_URL } from 'src/config/utils/src/util.constants';

interface GenerateKeyPairRequest {
  user: string;
  algorithm: string;
}

interface KeyPairResponse {
  status: number;
  message: string;
}

@Injectable()
export class KeyService {
  constructor(@InjectModel(Key.name) private readonly keyModel: Model<Key>) {}

  async generateKeyPair(
    request: GenerateKeyPairRequest,
  ): Promise<KeyPairResponse> {
    try {
      const response = await axios.post(
        `${MOTHRBOX_BASE_URL}/generate-keypairs`,
        request,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
      return {
        status: response.status,
        message: response.data,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return {
          status: error.response?.status || 500,
          message: error.response?.data || 'Failed to generate key pairs',
        };
      }
      return {
        status: 500,
        message: 'An unexpected error occurred',
      };
    }
  }
}
