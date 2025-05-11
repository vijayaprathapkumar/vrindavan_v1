export function formatDateToIST(date: Date | null): string | null {
  if (!date) return null;
  const istDate = new Date(date.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
  const day = String(istDate.getDate()).padStart(2, "0");
  const month = String(istDate.getMonth() + 1).padStart(2, "0");
  const year = istDate.getFullYear();
  return `${day}-${month}-${year}`;
}
