import jwt from 'jsonwebtoken';
import dotenv from "dotenv";

dotenv.config();

const SECRET_KEY = process.env.Token_SECRET_KEY;

export const generateToken = (mobile_number: string): string => {
  const payload = { mobile_number };
  return jwt.sign(payload, SECRET_KEY, { expiresIn: '10m' });
};

export const generateDeviceToken = (): string => {
  const generateRandomString = (length: number): string => {
    const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  };

  const randomString = generateRandomString(99);
  const timestamp = Date.now().toString(36); 
  const token = randomString + timestamp;

  // Ensure the token is 138 characters long
  return token.replace(/[^a-zA-Z0-9]/g, '0').padEnd(138, '0').substring(0, 138);
};
