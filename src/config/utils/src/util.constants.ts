import { config } from 'dotenv';
import { Algorithm } from 'jsonwebtoken';

config();

export const CRYPTO_SECRET = process.env.CRYPTO_SECRET as string;

export const JWT_SECRET = process.env.JWT_SECRET as string;

// db
export const DB_CONNECTION_STRING = process.env.DB_CONNECTION_STRING as string;
export const DB_NAME = 'mothrbox';

// jwt
export const COOKIE_SECRET = process.env.COOKIE_SECRET as string;

// Server
export const PORT = parseInt(process.env.PORT as string);
