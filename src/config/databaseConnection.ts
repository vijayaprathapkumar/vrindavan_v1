import mysql from "mysql2";
import dotenv from "dotenv";

dotenv.config();

export const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 60000 ,
    dateStrings: true
});

db.getConnection((err: mysql.QueryError | null) => {
    if (err) {
        console.error("Error connecting to MySQL Database:", err.message);
        throw err;
    }
    console.log("Connected to MySQL Database");
});
