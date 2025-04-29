/* eslint-disable @typescript-eslint/restrict-template-expressions */

/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { ConsoleLogger, ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from 'libs/utils/src/utils.logger';
import { WsAdapter } from '@nestjs/platform-ws';
import helmet from '@fastify/helmet';
import fastifyCsrf from '@fastify/csrf-protection';
import fastifyCookie from '@fastify/cookie';
import fastifyCors from '@fastify/cors';
import * as qs from 'qs';
import { COOKIE_SECRET, PORT } from 'libs/utils/src/util.constants';

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
      new winston.transports.File({
        filename: 'error.log',
        level: 'error',
        format: winston.format.combine(
          winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
          winston.format.printf(
            (info) =>
              `${info.timestamp} ${info.level.toUpperCase()}: ${info.message}`,
          ),
        ),
      }),
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

  // Add global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );
  // Configure CORS, exception filter, and security
  // app.enableCors();
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useWebSocketAdapter(new WsAdapter(app));
  // Register Fastify plugins with proper error handling
  try {
    await app.register(helmet);
    await app.register(fastifyCsrf);
    await app.register(fastifyCookie, {
      secret: COOKIE_SECRET,
    });
    await app.register(fastifyCors, {
      origin: ['http://localhost:3000'], // Enable CORS for localhost:3000
      credentials: true, // Allow credentials (cookies, authorization headers, etc.)
    });
  } catch (err) {
    logger.error(`Failed to register Fastify plugins: ${err.message}`);
  }
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
