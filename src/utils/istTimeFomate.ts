export function formatDateToIST(date: Date | null): string | null {
  if (!date) return null;
  const istDate = new Date(
    date.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
  );
  const day = String(istDate.getDate()).padStart(2, "0");
  const month = String(istDate.getMonth() + 1).padStart(2, "0");
  const year = istDate.getFullYear();
  return `${day}-${month}-${year}`;
}

export const toISTMidnightMySQLFormat = (date: string): string => {
  const dt = new Date(date);
  return dt.toISOString().slice(0, 19).replace("T", " ");
};

const toISTMidnightISOString = (date: string): string => {
  const dt = new Date(date);
  return dt.toISOString();
};
