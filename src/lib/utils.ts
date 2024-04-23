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

export const isTimeString = (value: string) => {
  const regexp = /^(2[0-3]|[01]?[0-9]):([0-5]?[0-9]):([0-5]?[0-9])$/;
  return regexp.test(value);
};

export const validatePhoneNumber = (phone: string) => {
  let phoneNumber = phone.replace(/\D/g, '');
  const validPrefixes = [
    '070',
    '080',
    '081',
    '090',
    '091',
    '70',
    '80',
    '81',
    '90',
    '91',
  ];

  if (phoneNumber.startsWith('0')) {
    if (
      validPrefixes.includes(phoneNumber.slice(0, 3)) &&
      phoneNumber.length === 11
    ) {
      phoneNumber = '234' + phoneNumber.slice(1);
      return phoneNumber;
    }
  } else if (phoneNumber.startsWith('234')) {
    if (validPrefixes.includes(phoneNumber.slice(3, 6))) {
      if (phoneNumber.charAt(3) === '0' && phoneNumber.length === 14) {
        phoneNumber = '234' + phoneNumber.split('2340')[1];
        return phoneNumber;
      }
    } else if (
      validPrefixes.includes(phoneNumber.slice(3, 5)) &&
      phoneNumber.length === 13
    )
      return phoneNumber;
  } else if (phoneNumber.startsWith('+234')) {
    if (
      validPrefixes.includes(phoneNumber.slice(4, 7)) &&
      phoneNumber.charAt(4) === '0' &&
      phoneNumber.length === 15
    ) {
      phoneNumber = '234' + phoneNumber.split('+2340')[1];
      return phoneNumber;
    } else if (
      validPrefixes.includes(phoneNumber.slice(4, 6)) &&
      phoneNumber.length === 14
    )
      return phoneNumber;
  }
  throw new Error('Invalid phone number');
};
