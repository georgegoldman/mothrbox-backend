/* eslint-disable @typescript-eslint/no-unsafe-return */

/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Key } from './key.schema';
import axios from 'axios';
import { MOTHRBOX_BASE_URL, SECRIT } from 'src/config/utils/src/util.constants';
import { KeyPairDTO } from './issue-token.dto';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
// import { fromHex } from '@mysten/sui/utils';
import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import { WalrusClient } from '@mysten/walrus';
import { Agent, setGlobalDispatcher } from 'undici';
import PQueue from 'p-queue';

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

  async testWalrus(): Promise<any> {
    const queue = new PQueue({ concurrency: 50 });
    try {
      setGlobalDispatcher(
        new Agent({
          connectTimeout: 60_000,
          connect: { timeout: 60_000 },
        }),
      );
      const suiClient = new SuiClient({
        url: getFullnodeUrl('testnet'),
      });
      const walrusClient = new WalrusClient({
        network: 'testnet',
        suiClient,
        storageNodeClientOptions: {
          onError: (error) => console.log(error),
          fetch: (url, options): Promise<Response> => {
            return queue.add(() => fetch(url, options)) as Promise<Response>;
          },
          timeout: 90000000000000,
        },
        packageConfig: {
          systemObjectId:
            '0x6c2547cbbc38025cf3adac45f63cb0a8d12ecf777cdc75a4971612bf97fdf6af',
          stakingPoolId:
            '0xbe46180321c30aab2f8b3501e24048377287fa708018a5b7c2792b35fe339ee3',
          subsidiesObjectId:
            '0xda799d85db0429765c8291c594d334349ef5bc09220e79ad397b30106161a0af',
          exchangeIds: [
            '0xf4d164ea2def5fe07dc573992a029e010dba09b1a8dcbc44c5c2e79567f39073',
            '0x19825121c52080bb1073662231cfea5c0e4d905fd13e95f21e9a018f2ef41862',
            '0x83b454e524c71f30803f4d6c302a86fb6a39e96cdfb873c2d1e93bc1c26a3bc5',
            '0x8d63209cf8589ce7aef8f262437163c67577ed09f3e636a9d8e0813843fb8bf1',
          ],
        },
      });

      const keypair = Ed25519Keypair.fromSecretKey(SECRIT);
      const file = new TextEncoder().encode(
        'Hi from the Mothrbox Backend!!!\n',
      );

      const result = await walrusClient.writeBlob({
        blob: file,
        deletable: false,
        epochs: 24,
        signer: keypair,
      });
      console.log('the result');
      console.log(result);
      // return result;
      // console.log('this is the write blob');
      // console.log(blobId);
      // return blobId;
    } catch (error) {
      console.log(error);
    }
  }
}
