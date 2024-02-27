import { Logger } from '@nestjs/common';
import * as argon2 from 'argon2';

const logger = new Logger('Utils');

export async function hashPassword(password: string): Promise<string> {
  try {
    const hash = await argon2.hash(password);
    return hash;
  } catch (err) {
    throw err;
  }
}

export async function checkPassword(
  inputPassword: string,
  storedHash: string,
): Promise<boolean> {
  try {
    const match = await argon2.verify(storedHash, inputPassword);
    return match; // true or false
  } catch (err) {
    throw err;
  }
}

function customHash(value) {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    const char = value.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return hash & 0xfffffff; // Return positive 28-bit integer
}

export function generateOTP() {
  return Array.from({ length: 6 })
    .map(() => Math.floor(Math.random() * 10))
    .join('');
}
