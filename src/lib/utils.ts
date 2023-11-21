import * as argon2 from 'argon2';

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

export function generateOTP(userId: string) {
  // Obtain current timestamp
  const timestamp = Date.now();

  // Generate a hash based on user ID
  const userIdHash = customHash(userId.toString());

  // Combine timestamp, userId hash, and random number to produce an OTP
  const combinedValue = timestamp * (Math.random() * userIdHash);

  // Convert the combined value to a 6-digit OTP
  const otp = Math.abs(combinedValue) % 1000000;

  return Math.floor(otp);
}
