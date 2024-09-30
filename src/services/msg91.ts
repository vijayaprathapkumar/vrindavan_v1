import axios from "axios";
import dotenv from "dotenv";

dotenv.config();


export const generateOTP = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString(); 
  };

  
export const sendOTP = async (
  mobile_number: string,
  otp: string
): Promise<void> => {
  const authKey = "155086Aw0IlR8NVh61488ba1P1";
  const senderId = "VRINDF";
  const route = "4";
  const templateId = "614885f059845876377d5114";

  const url = `https://api.msg91.com/api/v5/otp`;
  const params = {
    mobile: mobile_number,
    otp: otp,
    authkey: authKey,
    sender: senderId,
    route: route,
    template_id: templateId,
  };

  try {
    await axios.post(url, null, { params });
  } catch (error) {
    throw new Error("Error sending OTP. Please try again.");
  }
};
