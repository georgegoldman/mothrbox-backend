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

          reply
            .header(
              'Content-Type',
              response.headers['content-type'] || 'application/octet-stream',
            )
            .header(
              'Content-Disposition',
              response.headers['content-disposition'] ||
                `attachment; filename="${part.filename}.enc"`,
            );

          return response.data.pipe(reply.raw);
        } catch (error) {
          console.error(
            'Encryption error:',
            error?.response?.data || error.message,
          );
          throw new InternalServerErrorException('Failed to process file');
        }
      }
    }

    return reply.status(400).send({ message: 'No file uploaded' });
  }
}
