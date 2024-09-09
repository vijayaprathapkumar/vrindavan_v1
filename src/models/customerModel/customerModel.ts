import { db } from '../../config/databaseConnection';
import { RowDataPacket, OkPacket } from 'mysql2';

// Fetch all customers
export const getAllCustomers = async (): Promise<RowDataPacket[]> => {
  const [rows] = await db.promise().query<RowDataPacket[]>("SELECT * FROM Customers");
  return rows;
};

// Create a new customer
export const createCustomer = async (
  locality: string,
  name: string,
  email: string,
  mobile: string,
  houseNo: string,
  completeAddress: string,
  status: string
): Promise<void> => {
  await db.promise().query<OkPacket>(
    "INSERT INTO Customers (locality, name, email, mobile, house_no, complete_address, status) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [locality, name, email, mobile, houseNo, completeAddress, status]
  );
};

// Fetch customer by ID
export const getCustomerById = async (id: number): Promise<RowDataPacket[]> => {
  const [rows] = await db.promise().query<RowDataPacket[]>("SELECT * FROM Customers WHERE id = ?", [id]);
  return rows;
};

// Update customer by ID
export const updateCustomerById = async (
  id: number,
  locality: string,
  name: string,
  email: string,
  mobile: string,
  houseNo: string,
  completeAddress: string,
  status: string
): Promise<void> => {
  await db.promise().query<OkPacket>(
    "UPDATE Customers SET locality = ?, name = ?, email = ?, mobile = ?, house_no = ?, complete_address = ?, status = ? WHERE id = ?",
    [locality, name, email, mobile, houseNo, completeAddress, status, id]
  );
};

// Delete customer by ID
export const deleteCustomerById = async (id: number): Promise<void> => {
  await db.promise().query<OkPacket>("DELETE FROM Customers WHERE id = ?", [id]);
};
