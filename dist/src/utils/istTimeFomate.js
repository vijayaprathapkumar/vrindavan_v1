"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toIST = exports.toISTMidnightISOString = exports.toISTMidnightMySQLFormat = void 0;
exports.formatDateToIST = formatDateToIST;
function formatDateToIST(date) {
    if (!date)
        return null;
    const istDate = new Date(date.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
    const day = String(istDate.getDate()).padStart(2, "0");
    const month = String(istDate.getMonth() + 1).padStart(2, "0");
    const year = istDate.getFullYear();
    return `${day}-${month}-${year}`;
}
const toISTMidnightMySQLFormat = (date) => {
    const dt = new Date(date);
    return dt.toISOString().slice(0, 19).replace("T", " ");
};
exports.toISTMidnightMySQLFormat = toISTMidnightMySQLFormat;
const toISTMidnightISOString = (dateStr) => {
    if (!dateStr)
        return null;
    let date;
    if (typeof dateStr === 'string' || typeof dateStr === 'number') {
        date = new Date(dateStr);
    }
    else if (dateStr instanceof Date) {
        date = dateStr;
    }
    else {
        return null;
    }
    // Convert to IST midnight
    date.setHours(0, 0, 0, 0);
    const istOffset = 5.5 * 60; // IST offset in minutes
    const utc = date.getTime() + date.getTimezoneOffset() * 60000;
    const istDate = new Date(utc + 60000 * istOffset);
    return istDate.toISOString();
};
exports.toISTMidnightISOString = toISTMidnightISOString;
const toIST = (dateStr) => {
    if (!dateStr)
        return null;
    const date = new Date(dateStr); // assumes input is in UTC or ISO format
    return new Intl.DateTimeFormat("en-IN", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    }).format(date);
};
exports.toIST = toIST;
