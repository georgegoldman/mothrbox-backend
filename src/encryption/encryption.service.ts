import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { FastifyReply, FastifyRequest } from 'fastify';
import * as FormData from 'form-data';

@Injectable()
export class EncryptionService {
  constructor(private readonly httpService: HttpService) {}

  async encrypt(req: FastifyRequest, reply: FastifyReply, _id: string) {
    const parts = (req as any).parts?.();
    if (!parts) {
      return reply.status(400).send({ message: 'No files provided' });
    }

    for await (const part of parts) {
      if (part.file) {
        const chunks: Buffer[] = [];

        for await (const chunk of part.file) {
          chunks.push(chunk);
        }

        const fileBuffer = Buffer.concat(chunks);

        const formData = new FormData();
        formData.append('file', fileBuffer, part.filename);

        try {
          const response = await this.httpService.axiosRef.post(
            `${process.env.MOTHRBOX_BASE_URL}/encrypt_file/${_id}`,
            formData,
            {
              responseType: 'stream',
              headers: {
                Accept: 'application/msgpack',
                ...formData.getHeaders(),
              },
            },
          );

          const encryptedChunks: Buffer[] = [];
          for await (const chunk of response.data) {
            encryptedChunks.push(chunk);
          }

          const encryptedBuffer = Buffer.concat(encryptedChunks);
          const base64Data = encryptedBuffer.toString('base64');

          const fileName = `${part.filename}.enc`;

          return reply.status(200).send({
            message: "File Uploaded Successfully",
            filename: fileName,
            encryptionType: 'AES-256',
            date: new Date().toISOString(),
            status: 'SUCCESSFUL',
            encryptedData: base64Data,
          });
        } catch (error) {
          console.error(
            'Encryption error:',
            error?.response?.data || error.message,
          );

          return reply.status(500).send({
            message: "AN Error Occured While Uploading File",
            filename: part.filename,
            encryptionType: null,
            date: new Date().toISOString(),
            status: 'CANCELED',
            downloadUrl: null,
          });
        }
      }
    }

    return reply.status(400).send({ message: 'No file uploaded' });
  }
}
