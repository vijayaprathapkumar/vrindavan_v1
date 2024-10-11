// import { db } from "../../config/databaseConnection";
// import { RowDataPacket, OkPacket } from "mysql2";
// // Fetch all products
// export const getAllProducts = async (): Promise<RowDataPacket[]> => {
//   const [rows] = await db.promise().query<RowDataPacket[]>("SELECT * FROM Products");
//   return rows;
// };
// // Create a new product
// export const createProduct = async (
//   name: string,
//   price: number,
//   discountPrice: number,
//   description: string,
//   productTypeID: number,
//   brandID: number,
//   categoryID: number,
//   subcategoryID: number,
//   locality: string,
//   weightage: number,
//   image: string,
//   unitSize: string,
//   skuCode: string,
//   barcode: string,
//   cgst: number,
//   sgst: number,
//   featured: boolean,
//   subscription: boolean,
//   trackInventory: boolean
// ): Promise<void> => {
//   await db.promise().query<OkPacket>(
//     "INSERT INTO Products (Name, Price, DiscountPrice, Description, ProductTypeID, BrandID, CategoryID, SubcategoryID, Locality, Weightage, Image, UnitSize, SKUCode, Barcode, CGST, SGST, Featured, Subscription, TrackInventory, Active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE)",
//     [
//       name,
//       price,
//       discountPrice,
//       description,
//       productTypeID,
//       brandID,
//       categoryID,
//       subcategoryID,
//       locality,
//       weightage,
//       image,
//       unitSize,
//       skuCode,
//       barcode,
//       cgst,
//       sgst,
//       featured,
//       subscription,
//       trackInventory
//     ]
//   );
// };
// // Get product by ID
// export const getProductById = async (id: number): Promise<RowDataPacket[]> => {
//   const [rows] = await db.promise().query<RowDataPacket[]>(
//     "SELECT * FROM Products WHERE ProductID = ?",
//     [id]
//   );
//   return rows;
// };
// // Update product by ID
// export const updateProductById = async (
//   id: number,
//   name: string,
//   price: number,
//   discountPrice: number,
//   description: string,
//   productTypeID: number,
//   brandID: number,
//   categoryID: number,
//   subcategoryID: number,
//   locality: string,
//   weightage: number,
//   image: string,
//   unitSize: string,
//   skuCode: string,
//   barcode: string,
//   cgst: number,
//   sgst: number,
//   featured: boolean,
//   subscription: boolean,
//   trackInventory: boolean
// ): Promise<void> => {
//   await db.promise().query<OkPacket>(
//     "UPDATE Products SET Name = ?, Price = ?, DiscountPrice = ?, Description = ?, ProductTypeID = ?, BrandID = ?, CategoryID = ?, SubcategoryID = ?, Locality = ?, Weightage = ?, Image = ?, UnitSize = ?, SKUCode = ?, Barcode = ?, CGST = ?, SGST = ?, Featured = ?, Subscription = ?, TrackInventory = ? WHERE ProductID = ?",
//     [
//       name,
//       price,
//       discountPrice,
//       description,
//       productTypeID,
//       brandID,
//       categoryID,
//       subcategoryID,
//       locality,
//       weightage,
//       image,
//       unitSize,
//       skuCode,
//       barcode,
//       cgst,
//       sgst,
//       featured,
//       subscription,
//       trackInventory,
//       id
//     ]
//   );
// };
// // Delete product by ID
// export const deleteProductById = async (id: number): Promise<void> => {
//   await db.promise().query<OkPacket>(
//     "DELETE FROM Products WHERE ProductID = ?",
//     [id]
//   );
// };
