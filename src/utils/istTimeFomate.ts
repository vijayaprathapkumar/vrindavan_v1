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

export const toISTMidnightISOString = (dateStr: any): string | null => {
  if (!dateStr) return null;

  let date: Date;
  if (typeof dateStr === 'string' || typeof dateStr === 'number') {
    date = new Date(dateStr);
  } else if (dateStr instanceof Date) {
    date = dateStr;
  } else {
    return null;
  }

  // Convert to IST midnight
  date.setHours(0, 0, 0, 0);
  const istOffset = 5.5 * 60; // IST offset in minutes
  const utc = date.getTime() + date.getTimezoneOffset() * 60000;
  const istDate = new Date(utc + 60000 * istOffset);

  return istDate.toISOString();
};