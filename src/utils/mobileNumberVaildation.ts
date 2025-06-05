export const normalizeMobileNumber = (mobile: string) => {
  return mobile.replace(/^\+91|^0/, "");
};
