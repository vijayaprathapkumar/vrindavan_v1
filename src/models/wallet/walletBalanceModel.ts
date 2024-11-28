import { RowDataPacket } from "mysql2";
import { db } from "../../config/databaseConnection"; 

export interface WalletBalance {
    user_id: string;
    balance: number;  
    created_at: string;
    updated_at: string;
}

export const getWalletBalanceByUserId = (userId: string): Promise<WalletBalance | null> => {
    const query = `
        SELECT user_id, balance, created_at, updated_at
        FROM wallet_balances
        WHERE user_id = ?
    `;

    return new Promise((resolve, reject) => {
        db.query(query, [userId], (err, results: any[]) => {  
            if (err) {
                return reject(err);
            }
       
            if (!results || results.length === 0) {
                return resolve(null);
            }

            const result = results[0];
            const walletBalance: WalletBalance = {
                user_id: result.user_id,
                balance: parseFloat(result.balance),  
                created_at: result.created_at,
                updated_at: result.updated_at,
            };
            resolve(walletBalance);
        });
    });
};



export const getWalletBalanceByWithOutUserId = async (
    page: number,
    limit: number,
    startDate?: string,
    endDate?: string,
    searchTerm?: string
  ): Promise<{ walletBalances: WalletBalance[] | null; totalCount: number }> => {
    const offset = (page - 1) * limit;
  
    let baseQuery = `
      FROM 
        wallet_balances wb
      INNER JOIN 
        users u ON wb.user_id = u.id
      LEFT JOIN 
        delivery_addresses da ON da.user_id = u.id
      LEFT JOIN 
        localities l ON da.locality_id = l.id
      WHERE 1=1
    `;
  
    const params: any[] = [];
  
    if (startDate) {
      baseQuery += ` AND wb.created_at >= ?`;
      params.push(startDate);
    }
    if (endDate) {
      baseQuery += ` AND wb.created_at <= ?`;
      params.push(endDate);
    }
  
    if (searchTerm) {
      baseQuery += ` AND (u.name LIKE ? OR u.email LIKE ? OR u.phone LIKE ?)`;
      params.push(`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`);
    }
  
    // Query for total count
    const countQuery = `SELECT COUNT(*) as totalCount ${baseQuery}`;
    
    // Query for paginated data
    const dataQuery = `
      SELECT 
        wb.*,
        u.id AS user_id, u.name AS user_name, u.email, u.phone,
        da.id AS delivery_address_id, da.description AS address_description, da.address, 
        da.latitude AS address_latitude, da.longitude AS address_longitude, 
        da.house_no, da.complete_address, da.is_default,
        l.id AS locality_id, l.name AS locality_name, l.address AS locality_address, 
        l.google_address, l.latitude AS locality_latitude, l.longitude AS locality_longitude, l.city
      ${baseQuery}
      LIMIT ? OFFSET ?
    `;
    params.push(limit, offset);
  
    try {
      const [countResult]: [RowDataPacket[], any] = await db
        .promise()
        .query(countQuery, params.slice(0, -2)); // Exclude limit and offset for count query
      const totalCount = countResult[0].totalCount;
  
      const [walletBalances]: [RowDataPacket[], any] = await db
        .promise()
        .query(dataQuery, params);
  
      return { walletBalances: walletBalances.length > 0 ? walletBalances as WalletBalance[] : null, totalCount };
    } catch (error) {
      console.error("Error fetching wallet balance:", error);
      throw new Error("Failed to retrieve wallet balance");
    }
  };
  