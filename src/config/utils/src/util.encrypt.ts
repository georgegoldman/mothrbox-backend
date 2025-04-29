/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import * as bcrypt from 'bcrypt';
import { CRYPTO_SECRET } from './util.constants';
import Hashids = require('hashids');
import crypto from 'crypto';
// const Hashids = require('hashids');

/**
 *
 * @param password
 * @param saltRouds
 * @returns
 */

export function encryptPassword(password: string, saltRouds = 10) {
  try {
    const salt = bcrypt.genSaltSync(saltRouds);
    return bcrypt.hashSync(password, salt);
  } catch (e) {
    console.error(e);
    throw new Error('Error while encrypting password');
  }
}

/**
 *
 * @param password
 * @param hash
 * @returns
 */
export function verifyPassword(password: string, hash: string) {
  return bcrypt.compareSync(password, hash);
}

/**
 *
 * @param length
 * @returns
 */
export function generateSecret(length = 16) {
  return crypto.randomBytes(length).toString('hex');
}

const hashIds = new Hashids(CRYPTO_SECRET, 12);

/**
 *
 * @param objectId
 * @returns
 */
export function encryptObjectId(objectId) {
  return hashIds.encodeHex(objectId);
}

export function decryptObjectId(shortId) {
  return hashIds.decodeHex(shortId);
}

export default {
  encryptPassword,
  verifyPassword,
  generateSecret,
  decryptObjectId,
  encryptObjectId,
};
