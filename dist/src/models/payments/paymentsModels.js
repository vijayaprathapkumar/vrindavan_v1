"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.everyDayPaymentProcessJob = exports.processTodayOrderPayments = exports.getAllPlaceOrdersUsers = exports.deductFromWalletBalance = exports.handlePaymentsOrders = void 0;
const databaseConnection_1 = require("../../config/databaseConnection");
const node_cron_1 = __importDefault(require("node-cron"));
const moment_1 = __importDefault(require("moment"));
const handlePaymentsOrders = async (placeOrderData) => {
    const { user_id, food_price, quantity, order_id, status, food_name, unit } = placeOrderData;
    const totalOrderValue = parseFloat(food_price || "0") * parseInt(quantity || "0");
    const deductionSuccess = await (0, exports.deductFromWalletBalance)(user_id, totalOrderValue);
    if (!deductionSuccess) {
        throw new Error("Failed to deduct from wallet balance.");
    }
    const paymentSql = `
      INSERT INTO payments (price, user_id, status, method, created_at, updated_at) 
      VALUES (?, ?, ?, ?, NOW(), NOW());
    `;
    const paymentValues = [totalOrderValue, user_id, status, "wallet"];
    try {
        const [paymentResult] = await databaseConnection_1.db
            .promise()
            .query(paymentSql, paymentValues);
        if (paymentResult.affectedRows === 0) {
            throw new Error("Payment insertion failed.");
        }
        const [walletRows] = await databaseConnection_1.db
            .promise()
            .query(`SELECT balance FROM wallet_balances WHERE user_id = ?`, [
            user_id,
        ]);
        const beforeBalance = parseFloat(walletRows[0]?.balance || "0");
        if (isNaN(beforeBalance) || beforeBalance === 0) {
            console.log("Wallet balance not found or is 0. Skipping deduction.");
        }
        const afterBalance = parseFloat((beforeBalance - totalOrderValue).toFixed(2));
        const transactionDescription = `₹${totalOrderValue} deducted for ${food_name} ${unit} x ${quantity}. Balance ₹${totalOrderValue}`;
        await logWalletTransaction(user_id, order_id, beforeBalance, totalOrderValue, afterBalance, transactionDescription);
        return true;
    }
    catch (error) {
        console.error("Error creating order:", error);
        throw new Error("Failed to create order.");
    }
};
exports.handlePaymentsOrders = handlePaymentsOrders;
const logWalletTransaction = async (userId, orderId, beforeBalance, amount, afterBalance, description) => {
    const walletLogSql = `
    INSERT INTO wallet_logs (
      user_id, 
      order_id, 
      order_date, 
      before_balance, 
      amount, 
      after_balance, 
      wallet_type, 
      description, 
      created_at, 
      updated_at
    ) 
    VALUES (?, ?, NOW(), ?, ?, ?, ?, ?, NOW(), NOW());
    `;
    const walletLogValues = [
        userId,
        orderId,
        beforeBalance,
        amount,
        afterBalance,
        "deduction",
        description,
    ];
    try {
        await databaseConnection_1.db.promise().query(walletLogSql, walletLogValues);
    }
    catch (error) {
        console.error("Error logging wallet transaction:", error);
    }
};
const deductFromWalletBalance = async (userId, amount) => {
    const sql = `
        UPDATE wallet_balances 
        SET balance = balance - ? 
        WHERE user_id = ?;
    `;
    try {
        const [result] = await databaseConnection_1.db
            .promise()
            .query(sql, [amount, userId]);
        if (result.affectedRows === 0) {
            throw new Error("Wallet balance not found for the user.");
        }
        return true;
    }
    catch (error) {
        console.error("Error updating wallet balance:", error);
        return false;
    }
};
exports.deductFromWalletBalance = deductFromWalletBalance;
const getAllPlaceOrdersUsers = async (currentDate) => {
    const query = `
      SELECT 
        o.id AS order_id,
        o.user_id,
        o.order_date,
        fo.price AS food_price,
        fo.quantity,
        f.name AS food_name,
        f.unit
      FROM 
        orders o
      LEFT JOIN 
        food_orders fo ON o.id = fo.order_id
      LEFT JOIN 
        foods f ON f.id = fo.food_id
      WHERE 
        DATE(o.order_date) = ?;
    `;
    const [placeOrderRows] = await databaseConnection_1.db
        .promise()
        .query(query, [currentDate]);
    return placeOrderRows;
};
exports.getAllPlaceOrdersUsers = getAllPlaceOrdersUsers;
const processTodayOrderPayments = async (currentDate) => {
    try {
        console.time("paymentProcessing");
        const orders = await (0, exports.getAllPlaceOrdersUsers)(currentDate);
        if (orders.length === 0) {
            console.log("No orders to process for today.");
            return;
        }
        await Promise.all(orders.map((order) => (0, exports.handlePaymentsOrders)(order)));
        console.timeEnd("paymentProcessing");
        console.log("Today's payment processed successfully.");
    }
    catch (error) {
        console.error("Error processing today's orders:", error);
    }
};
exports.processTodayOrderPayments = processTodayOrderPayments;
const everyDayPaymentProcessJob = () => {
    node_cron_1.default.schedule("00 15 * * *", async () => {
        console.log("Cron job running...");
        console.time("paymentProcessing");
        const currentDate = new Date().toISOString().split("T")[0];
        const jobStartTime = (0, moment_1.default)().format("YYYY-MM-DD HH:mm:ss");
        let jobEndTime = "";
        let jobDuration = "";
        try {
            await (0, exports.processTodayOrderPayments)(currentDate);
            jobEndTime = (0, moment_1.default)().format("YYYY-MM-DD HH:mm:ss");
            jobDuration = (0, moment_1.default)(jobEndTime).diff((0, moment_1.default)(jobStartTime), "seconds");
            const logMessage = `Subscription orders bill placed on ${currentDate.toLocaleString()}`;
            const sqlQuery = `
        INSERT INTO cron_logs (log_date, cron_logs, created_at, updated_at)
        VALUES (NOW(), ?, NOW(), NOW())
      `;
            const values = [
                `Job Start: ${jobStartTime}, Job End: ${jobEndTime}, Duration: ${jobDuration}s, Message: ${logMessage}`,
            ];
            await databaseConnection_1.db.promise().query(sqlQuery, values);
            console.timeEnd("paymentProcessing");
            console.log("Today's payment processed successfully.");
        }
        catch (error) {
            console.error("Error running processTodayOrderPayments:", error);
        }
    });
};
exports.everyDayPaymentProcessJob = everyDayPaymentProcessJob;
