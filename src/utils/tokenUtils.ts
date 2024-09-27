import jwt from 'jsonwebtoken';
import dotenv from "dotenv";

dotenv.config();

const SECRET_KEY = process.env.Token_SECRET_KEY;

export const generateToken = (mobile_number: string): string => {
  const payload = { mobile_number };
  return jwt.sign(payload, SECRET_KEY, { expiresIn: '10m' });
};

export const generateDeviceToken = (): string => {
  const randomString = Math.random().toString(36).substring(2); 
  const timestamp = Date.now().toString(36); 
  const token = randomString + timestamp;
  return token.replace(/[^a-zA-Z0-9]/g, '0').padEnd(138, '0').substring(0, 138); 
};
