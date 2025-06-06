/* eslint-disable @typescript-eslint/restrict-template-expressions */

/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { ConsoleLogger, ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from 'src/config/utils/src/utils.logger';
import { WsAdapter } from '@nestjs/platform-ws';
import helmet from '@fastify/helmet';
import fastifyCsrf from '@fastify/csrf-protection';
import fastifyCookie from '@fastify/cookie';
import * as qs from 'qs';
import { COOKIE_SECRET, PORT } from 'src/config/utils/src/util.constants';
import multipart from '@fastify/multipart';

async function bootstrap() {
  // configure comprehensive winston logging
  const logger = WinstonModule.createLogger({
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
          winston.format.printf(
            (info) =>
              `${info.timestamp} ${info.level.toUpperCase()}: ${info.message}`,
          ),
        ),
      }),
      // new winston.transports.File({
      //   filename: 'error.log',
      //   level: 'error',
      //   format: winston.format.combine(
      //     winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      //     winston.format.printf(
      //       (info) =>
      //         `${info.timestamp} ${info.level.toUpperCase()}: ${info.message}`,
      //     ),
      //   ),
      // }),
      new winston.transports.File({
        filename: 'combined.log',
        format: winston.format.combine(
          winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
          winston.format.printf(
            (info) =>
              `${info.timestamp} ${info.level.toUpperCase()}: ${info.message}`,
          ),
        ),
      }),
    ],
  });

  // Configure Fastify with proper error handling for query string parsing
  const fastifyAdapter = new FastifyAdapter({
    logger: true, // Enable Fastify's built-in logger
    querystringParser: (str) => {
      try {
        return qs.parse(str);
      } catch (err) {
        logger.error(`Query string parsing failed: ${err.message}`);
        return {};
      }
    },
  });

  // Create application with better logging
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    fastifyAdapter,
    { logger: new ConsoleLogger({ json: false }) },
  );

  // Get the underlying Fastify instance
  const fastifyInstance = app.getHttpAdapter().getInstance();

  // Register Fastify plugins on the Fastify instance (not the NestJS app)
  try {
    await fastifyInstance.register(helmet as any);
    await fastifyInstance.register(fastifyCookie as any, {
      secret: COOKIE_SECRET,
    });
    await fastifyInstance.register(fastifyCsrf as any);
    await fastifyInstance.register(multipart as any, {
      limits: {
        fieldNameSize: 100,
        fieldSize: 100,
        fields: 10,
        fileSize: 500 * 1024 * 1024,
        files: 1,
        headerPairs: 2000,
      },
    });
  } catch (err) {
    logger.error(`Failed to register Fastify plugins: ${err.message}`);
  }

  // enable CORS using NestJS's method
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'https://mothrbox.vercel.app',
      'https://www.mothrbox.xyz',
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // Add global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  // Configure CORS, exception filter, and security
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useWebSocketAdapter(new WsAdapter(app));

  // Start the server with proper error handling
  try {
    const port = PORT || 3000;
    await app.listen(port, '0.0.0.0');
    logger.log(`Application started successfully on port ${port}`);
  } catch (err) {
    logger.error(`Failed to start server: ${err.message}`);
  }
}

bootstrap().catch((err) => {
  console.error('failed to bootstrap application: ', err);
});
