// import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
// import dotenv from "dotenv";
// dotenv.config();
// export const sendOTP = async (phoneNumber: string, otp: string): Promise<void> => {
//   const params = {
//     Message: `Your OTP code is: ${otp}`,
//     PhoneNumber: phoneNumber,
//     MessageAttributes: {
//       "AWS.SNS.SMS.SenderID": {
//         DataType: "String",
//         StringValue: "MySenderID", // Replace with a valid SenderID
//       },
//     },
//   };
//   const sns = new SNSClient({
//     region: process.env.AWS_REGION,
//     credentials: {
//       accessKeyId: process.env.PERSONAL_KEY,
//       secretAccessKey: process.env.PERSONAL_SECRET,
//     },
//   });
//   try {
//     const command = new PublishCommand(params);
//     await sns.send(command);
//   } catch (error) {
//     console.error("Error sending OTP via SNS:", error);
//     throw new Error("Error sending OTP. Please try again.");
//   }
// };
