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

// sui
export const SECRIT = process.env.SECRIT as string;
export const CLOUDINARY_NAME = process.env.CLOUDINARY_NAME as string;
export const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY as string;
export const CLOUDINARY_API_SECRET = process.env
  .CLOUDINARY_API_SECRET as string;

// otp constant
export const OTP_EXPIRATION_TIME_IN_SECONDS = 600;
export const OTP_EXPIRATION_TIME_IN_WORDS = '10 minutes';

// email constant
export const EMAIL_CONSTANT = {
  appName: 'Mothrbox',
};

// queue constant
export const QUEUE_CONSTANT = {
  EMAIL: {
    name: 'email',
    processors: {},
  },
};

// smtp
export const SMTP_PORT = process.env.SMTP_PORT as string;
export const SMTP_HOST = process.env.SMTP_HOST as string;
export const SMTP_PASSWORD = process.env.SMTP_PASSWORD as string;
export const SMTP_USER = process.env.SMTP_USER as string;
export const SMTP_EMAIL = process.env.SMTP_EMAIL as string;

// twillo
export const TWILLO_ACCOUNT_ID = process.env.TWILLO_ACCOUNT_ID as string;
export const TWILLO_AUTH_TOKEN = process.env.TWILLO_AUTH_TOKEN as string;
export const TWILLO_FROM_NUMBER = process.env.TWILLO_FROM_NUMBER as string;

export const SMART_CONTRACT_API = process.env.SMART_CONTRACT_API as string;

export const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS as string;
