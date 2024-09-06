// routes /login.tsx
import express from 'express';
import { requestOTP, verifyOTP } from '../controllers/authLogin';

const router = express.Router();

router.post('/request-otp', requestOTP);
router.post('/verify-otp', verifyOTP);

export default router;
