import { db } from "../../config/databaseConnection";
import { RowDataPacket, OkPacket } from "mysql2";

// Fetch all delivery boys
export const getAllDeliveryBoys = async (): Promise<RowDataPacket[]> => {
  const [rows] = await db
    .promise()
    .query<RowDataPacket[]>("SELECT * FROM delivery_boys");
  return rows;
};

// Create a new delivery boy
export const createDeliveryBoy = async (
  userId: number,
  name: string | null,
  mobile: string | null,
  active: boolean,
  cashCollection: boolean,
  deliveryFee: number,
  totalOrders: number,
  earning: number,
  available: boolean,
  addressPickup: string | null,
  latitudePickup: string | null,
  longitudePickup: string | null
): Promise<void> => {
  await db
    .promise()
    .query<OkPacket>(
      "INSERT INTO delivery_boys (user_id, name, mobile, active, cash_collection, delivery_fee, total_orders, earning, available, addressPickup, latitudePickup, longitudePickup) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [userId, name, mobile, active ? 1 : 0, cashCollection ? 1 : 0, deliveryFee, totalOrders, earning, available ? 1 : 0, addressPickup, latitudePickup, longitudePickup]
    );
};

// Fetch delivery boy by ID
export const getDeliveryBoyById = async (id: number): Promise<RowDataPacket[]> => {
  const [rows] = await db
    .promise()
    .query<RowDataPacket[]>("SELECT * FROM delivery_boys WHERE id = ?", [id]);
  return rows;
};

// Update delivery boy by ID
export const updateDeliveryBoyById = async (
  id: number,
  userId: number,
  name: string | null,
  mobile: string | null,
  active: boolean,
  cashCollection: boolean,
  deliveryFee: number,
  totalOrders: number,
  earning: number,
  available: boolean,
  addressPickup: string | null,
  latitudePickup: string | null,
  longitudePickup: string | null
): Promise<void> => {
  await db
    .promise()
    .query<OkPacket>(
      "UPDATE delivery_boys SET user_id = ?, name = ?, mobile = ?, active = ?, cash_collection = ?, delivery_fee = ?, total_orders = ?, earning = ?, available = ?, addressPickup = ?, latitudePickup = ?, longitudePickup = ? WHERE id = ?",
      [userId, name, mobile, active ? 1 : 0, cashCollection ? 1 : 0, deliveryFee, totalOrders, earning, available ? 1 : 0, addressPickup, latitudePickup, longitudePickup, id]
    );
};

// Delete delivery boy by ID
export const deleteDeliveryBoyById = async (id: number): Promise<void> => {
  await db
    .promise()
    .query<OkPacket>("DELETE FROM delivery_boys WHERE id = ?", [id]);
};
