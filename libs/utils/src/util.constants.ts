import { config } from 'dotenv';
import { Algorithm } from 'jsonwebtoken';
import { readFileSync } from 'fs';
import { join } from 'path';

config();

export const CRYPTO_SECRET = process.env.CRYPTO_SECRET as string;

export const JWT_SECRET =
  process.env.JWT_PRIVATE_KEY?.replace(/\\n/g, '\n') ||
  readFileSync(join(process.cwd(), 'secrets', 'private_key.pem'), 'utf-8');

// db
export const DB_CONNECTION_STRING = process.env.DB_CONNECTION_STRING as string;
export const DB_NAME = 'mothrbox';

// jwt
export const COOKIE_SECRET = process.env.COOKIE_SECRET as string;

// Server
export const PORT = parseInt(process.env.NEST_PORT as string);
