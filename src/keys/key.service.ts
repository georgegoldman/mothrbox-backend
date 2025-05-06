/* eslint-disable @typescript-eslint/no-unsafe-return */

/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Key } from './key.schema';
import axios from 'axios';
import { MOTHRBOX_BASE_URL } from 'src/config/utils/src/util.constants';
import { KeyPairDTO } from './issue-token.dto';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

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
  constructor(
    @InjectModel(Key.name) private readonly keyModel: Model<Key>,
    private readonly httpService: HttpService,
  ) {}

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

  async issueToken(payload: KeyPairDTO): Promise<string> {
    try {
      const response = await axios.post(
        `${MOTHRBOX_BASE_URL}/issue-token`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
      return response.data as string;
    } catch (error) {
      throw new Error(
        `Failed to issue token: ${
          error.response?.data || error.message || 'Unknown error'
        }`,
      );
    }
  }

  async getAllKeypairs(): Promise<any[]> {
    try {
      const response$ = this.httpService.get(`${MOTHRBOX_BASE_URL}/keypair`, {
        headers: {
          'x-api-key': '08af34fa-fe22-49cc-8bb9-aa552a7a40ef',
        },
      });

      const response = await lastValueFrom(response$);
      return response.data; // should be a list of keypairs
    } catch (error) {
      throw new Error(
        `Failed to issue token: ${
          error.response?.status || error.message || 'Unknown error'
        }`,
      );
    }
  }
}
