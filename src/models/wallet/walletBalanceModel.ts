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
