import { config } from 'dotenv';
import { Algorithm } from 'jsonwebtoken';

config();

export const CRYPTO_SECRET = process.env.CRYPTO_SECRET as string;

export const JWT_SECRET = process.env.JWT_SECRET as string;
export const APP_NAME = 'mothrbox';
export const NODE_ENV = process.env.NODE_ENV as
  | 'development'
  | 'production'
  | 'test';

// db
export const DB_CONNECTION_STRING = process.env.DB_CONNECTION_STRING as string;
export const DB_NAME = 'mothrbox';

// jwt
export const COOKIE_SECRET = process.env.COOKIE_SECRET as string;

// Server
export const PORT = parseInt(process.env.PORT as string);

// auth constants
export const nonceRateLimitWindow = 60; // 1 minute in seconds
export const nonceRateLimitMax = 4; // Maximum nonce requests per minute

// wallet constants
export const walletMessagePrefix = `Sign this message to authenticate with ${APP_NAME}: `;

// mothrbox
export const MOTHRBOX_BASE_URL = process.env.MOTHRBOX_BASE_URL as string;
