// src/utils/responseHandler.ts
interface ApiResponse {
  statusCode: number;
  message: string;
  data?: any;
}

export const createResponse = (
  statusCode: number,
  message: string,
  data: any = null
): ApiResponse => {
  return {
    statusCode,
    message,
    data,
  };
};
