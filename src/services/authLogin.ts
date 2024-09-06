import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
import dotenv from "dotenv";

dotenv.config();

export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // Generate a 6-digit OTP
};

export const sendOTP = async (
  phoneNumber: string,
  otp: string
): Promise<void> => {
  const params = {
    Message: `Your OTP code is: ${otp}`,
    PhoneNumber: phoneNumber,
    MessageAttributes: {
      "AWS.SNS.SMS.SenderID": {
        DataType: "String",
        StringValue: "MySenderID", // Replace with a valid SenderID
      },
    },
  };

  const sns = new SNSClient({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });

  try {
    const command = new PublishCommand(params);
    await sns.send(command);
  } catch (error) {
    console.error(
      "Error sending OTP via SNS:",
      error instanceof Error ? error.message : "Unknown error"
    );
    throw new Error("Error sending OTP. Please try again.");
  }
};
