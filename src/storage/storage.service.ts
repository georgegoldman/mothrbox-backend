import { Injectable } from '@nestjs/common';
import { EncryptionService } from '../encryption/encryption.service';
import { v4 as uuidv4 } from 'uuid';
import { HttpService } from '@nestjs/axios';
import { MOTHRBOX_BASE_URL } from 'src/config/utils/src/util.constants';
import { UserDocument } from 'src/users/user.shemas';
import { UploadFileDto } from 'src/common/dtos';
import { MultipartFile } from '@fastify/multipart';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Storage, StorageDocument } from 'src/storage/storage.schema';

@Injectable()
export class StorageService {
  constructor(
    @InjectModel(Storage.name)
    private storageModel: Model<StorageDocument>,
    private readonly encryptionService: EncryptionService,
    private readonly httpService: HttpService,
  ) {}

  async uploadFile(
    files: AsyncIterableIterator<MultipartFile>,
    user: UserDocument | undefined,
    payload: UploadFileDto,
  ) {
    for await (const file of files) {
      if (file.type === 'file') {
        const buffer = await file.toBuffer();

        const savedFile = await this.storageModel.create({
          filename: file.filename,
          content: buffer,
          mimetype: file.mimetype,
          size: buffer.length,
          metadata: {
            mimetype: file.mimetype,
            size: buffer.length,
          },
          user: user?._id || null,
          ephemeralPublicKey: payload.recipientPublicKey || null,
        });

        return {
          message: 'File uploaded successfully',
          filename: savedFile.filename,
          mimetype: savedFile.metadata.mimetype,
          size: savedFile.metadata.size,
          fileId: savedFile._id,
          ephemeralPublicKey: payload.recipientPublicKey,
        };
      }
    }

    return { message: 'No file found in upload.' };
  }

  async getFileById(fileId: string): Promise<StorageDocument> {
    try {
      const file = await this.storageModel.findById(fileId);
      if (!file) {
        throw new Error('File not found');
      }
      return file;
    } catch (error) {
      console.error('Error retrieving file:', error);
      throw new Error(`Failed to retrieve file: ${error}`);
    }
  }

  async handleFileUpload(user: UserDocument, payload: UploadFileDto) {
    const fileId = uuidv4();
    const encrypted = await this.encryptionService.encryptFile(user, payload);

    const storageUrl = await this.httpService.axiosRef.post(
      `${MOTHRBOX_BASE_URL}/${fileId}`,
      { data: encrypted.encryptedData },
    );

    const metadata = {
      ...payload.metadata,
      fileId,
      userId: user._id,
      ephemeralPublicKey: encrypted.ephemeralPublicKey,
      timestamp: new Date().toISOString(),
    };

    return {
      ...metadata,
      storageUrl,
    };
  }
}
