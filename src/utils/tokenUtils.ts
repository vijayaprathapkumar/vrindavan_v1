import jwt from 'jsonwebtoken';
import dotenv from "dotenv";

dotenv.config();

const SECRET_KEY = process.env.Token_SECRET_KEY;

export const generateToken = (mobile_number: string, device_token: string): string => {
  const payload = { mobile_number, device_token }; 
  return jwt.sign(payload, SECRET_KEY, { expiresIn: '10m' });
};

export const generateDeviceToken = (): string => {
  const length = 138; 
  const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'; 

  const generateRandomString = (length: number): string => {
    let result = '';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  };

  const randomString = generateRandomString(length);
  return randomString; 
};