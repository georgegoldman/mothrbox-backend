// src/common/dtos/index.ts
export class UploadFileDto {
  userId: string;
  recipientPublicKey: string;
  fileContent: string;
  metadata?: Record<string, any>;
}

export class EncryptedResponseDto {
  encryptedData: string;
  ephemeralPublicKey: string;
}
