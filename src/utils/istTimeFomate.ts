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

export function toISTMidnightMySQLFormat(dateStr: string): string {
  const date = new Date(dateStr);
  // Set time to IST midnight (UTC +5:30)
  date.setUTCHours(18, 30, 0, 0); // IST midnight → 18:30 UTC previous day

  // Format to MySQL DATETIME string
  const pad = (n: number) => n.toString().padStart(2, "0");

  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(
    date.getUTCDate()
  )} ${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(
    date.getUTCSeconds()
  )}`;
}

export const toISTMidnightISOString = (
  date: string | Date | null
): string | null => {
  if (!date) return null;

  const d = new Date(date);

  // Set the time to 00:00 IST (18:30 UTC of the previous day)
  d.setUTCHours(18, 30, 0, 0); // Adjust for IST: 00:00 IST = 18:30 UTC

  // Ensure to return the date in the correct format
  return d.toISOString().slice(0, 19).replace("T", " ");
};
