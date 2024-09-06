"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendOTP = exports.generateOTP = void 0;
const client_sns_1 = require("@aws-sdk/client-sns");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString(); // Generate a 6-digit OTP
};
exports.generateOTP = generateOTP;
const sendOTP = async (phoneNumber, otp) => {
    const params = {
        Message: `Your OTP code is: ${otp}`,
        PhoneNumber: phoneNumber,
        MessageAttributes: {
            'AWS.SNS.SMS.SenderID': {
                DataType: 'String',
                StringValue: 'MySenderID', // Replace with a valid SenderID
            },
        },
    };
    const sns = new client_sns_1.SNSClient({
        region: process.env.AWS_REGION,
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        },
    });
    try {
        const command = new client_sns_1.PublishCommand(params);
        await sns.send(command);
    }
    catch (error) {
        console.error('Error sending OTP via SNS:', error instanceof Error ? error.message : 'Unknown error');
        throw new Error('Error sending OTP. Please try again.');
    }
};
exports.sendOTP = sendOTP;
