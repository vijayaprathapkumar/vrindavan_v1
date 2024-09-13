import { db } from "../../config/databaseConnection";
import { RowDataPacket, OkPacket } from "mysql2";

// Fetch all detailed commissions
export const getAllDetailedCommissions = async (): Promise<RowDataPacket[]> => {
  const [rows] = await db.promise().query<RowDataPacket[]>("SELECT * FROM detailed_commission");
  return rows;
};

// Fetch detailed commission by ID
export const getDetailedCommissionById = async (id: number): Promise<RowDataPacket[]> => {
  const [rows] = await db.promise().query<RowDataPacket[]>("SELECT * FROM detailed_commission WHERE id = ?", [id]);
  return rows;
};

// Create a new detailed commission
export const createDetailedCommission = async (
  monthly_commission_id: number,
  delivery_boy_id: number,
  product_id: number,
  quantity: number,
  commission: number,
  total_commission: number,
  month: number,
  year: number
): Promise<void> => {
  await db.promise().query<OkPacket>(
    "INSERT INTO detailed_commission (monthly_commission_id, delivery_boy_id, product_id, quantity, commission, total_commission, month, year) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    [monthly_commission_id, delivery_boy_id, product_id, quantity, commission, total_commission, month, year]
  );
};

// Update detailed commission by ID
export const updateDetailedCommissionById = async (
  id: number,
  monthly_commission_id: number,
  delivery_boy_id: number,
  product_id: number,
  quantity: number,
  commission: number,
  total_commission: number,
  month: number,
  year: number
): Promise<void> => {
  await db.promise().query<OkPacket>(
    "UPDATE detailed_commission SET monthly_commission_id = ?, delivery_boy_id = ?, product_id = ?, quantity = ?, commission = ?, total_commission = ?, month = ?, year = ? WHERE id = ?",
    [monthly_commission_id, delivery_boy_id, product_id, quantity, commission, total_commission, month, year, id]
  );
};

// Delete detailed commission by ID
export const deleteDetailedCommissionById = async (id: number): Promise<void> => {
  await db.promise().query<OkPacket>("DELETE FROM detailed_commission WHERE id = ?", [id]);
};
