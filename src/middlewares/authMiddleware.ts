import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.Token_SECRET || 'your_secret_key';

export interface CustomRequest extends Request {
    user?: { mobile_number: string; device_token: string }; 
}

export const authMiddleware = (req: CustomRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    console.log('Authorization Header:', authHeader); 
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        console.log('No token provided');
        return res.sendStatus(401); // Unauthorized
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            console.error('JWT verification error:', err); 
            return res.sendStatus(403); 
        }
        console.log('Decoded User:', user);
        req.user = user; 
        next();
    });
};
