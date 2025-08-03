import { Request, Response } from "express";
import {
  deleteAllCartItemsByUserId,
  addOrdersEntry,
  addFoodOrderEntry,
  getCartItemsByUserId,
  deductFromWalletOneTimeOrder,
  logWalletOneTimeOrder,
  getFoodNameById,
  updateOrderWalletInfo,
} from "../../models/placeOrder/placeOrderModels";
import { createResponse } from "../../utils/responseHandler";
import {
  getDealByFoodId,
  resetFoodDiscountPrice,
  updateDealQuantity,
  updateFoodDiscountPrice,
} from "../../models/dealOfTheDay/dealOfTheDayModel";
import { db } from "../../config/databaseConnection";

// Add a place order and clear the cart
export const placeOneTimeOrder = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { userId, orderDate } = req.body;

  try {
    const cartItems = await getCartItemsByUserId(userId);

    if (!cartItems.length) {
      return res.status(400).json(createResponse(400, "No items in cart."));
    }

    const orderPromises = cartItems.map(async (item) => {
      if (item.quantity > 0) {
        await placeOrder(item, userId, orderDate);
      } else {
        console.log("Failed to add place order.");
      }
    });

    await Promise.all(orderPromises);
    await deleteAllCartItemsByUserId(userId);

    return res
      .status(201)
      .json(
        createResponse(
          201,
          "Place order added successfully, cart cleared, and wallet updated.",
          null
        )
      );
  } catch (error) {
    console.error("Error adding place order:", error);
    return res
      .status(500)
      .json(createResponse(500, "Failed to add place order."));
  }
};

export const placeOrder = async (productData, user_id, orderDate) => {
  const { price, food_id, quantity, discount_price } = productData;
  
  if (quantity <= 0) {
    console.log(`Skipping food ID ${food_id} due to zero quantity.`);
    return null;
  }

  let connection;
  try {
    // Get a database connection
    connection = await db.promise().getConnection();
    await connection.beginTransaction();

    try {
      // Determine the final price (discount > deal > regular)
      let productAmount = discount_price ?? null;

      // Check for active deals if no discount price
      if (productAmount === null) {
        const [dealRows] = await connection.query(
          "SELECT * FROM deals WHERE food_id = ? AND quantity > 0 AND start_date <= NOW() AND end_date >= NOW() LIMIT 1",
          [food_id]
        );

        if (dealRows.length > 0) {
          const deal = dealRows[0];
          productAmount = deal.offer_price;
          
          // Update food discount price
          await connection.query(
            "UPDATE foods SET discount_price = ? WHERE id = ?",
            [deal.offer_price, food_id]
          );
        }
      }

      // Fallback to regular price if no discount or deal
      productAmount = productAmount ?? price;

      // Validate the final price
      if (productAmount <= 0) {
        throw new Error(`Invalid price for food ID ${food_id}`);
      }

      // Create the order record
      const [orderResult] = await connection.query(
        "INSERT INTO orders (user_id, order_date) VALUES (?, ?)",
        [user_id, orderDate]
      );
      const orderId = orderResult.insertId;

      // Calculate total amount
      const totalAmount = productAmount * quantity;

      // Process payment (deduct from wallet)
      const [walletRows] = await connection.query(
        "SELECT balance FROM wallet_balances WHERE user_id = ? FOR UPDATE",
        [user_id]
      );
      
      if (walletRows.length === 0) {
        throw new Error('Wallet not found');
      }

      const currentBalance = parseFloat(walletRows[0].balance);
      if (currentBalance < totalAmount) {
        throw new Error('Insufficient balance');
      }

      const newBalance = currentBalance - totalAmount;

      // Update wallet balance
      await connection.query(
        "UPDATE wallet_balances SET balance = ?, updated_at = NOW() WHERE user_id = ?",
        [newBalance.toFixed(2), user_id]
      );

      // Record payment
      const [paymentResult] = await connection.query(
        "INSERT INTO payments (user_id, order_id, amount, status) VALUES (?, ?, ?, 'completed')",
        [user_id, orderId, totalAmount]
      );
      const paymentId = paymentResult.insertId;

      // Update order with payment info
      await connection.query(
        "UPDATE orders SET payment_id = ? WHERE id = ?",
        [paymentId, orderId]
      );

      // Add food to order
      await connection.query(
        "INSERT INTO food_orders (order_id, food_id, price, quantity) VALUES (?, ?, ?, ?)",
        [orderId, food_id, productAmount, quantity]
      );

      // If this was a deal, update deal quantity
      if (productAmount !== price && productAmount !== discount_price) {
        const [updatedDeal] = await connection.query(
          "UPDATE deals SET quantity = quantity - ? WHERE food_id = ? RETURNING quantity",
          [quantity, food_id]
        );

        if (updatedDeal[0].quantity === 0) {
          await connection.query(
            "UPDATE foods SET discount_price = NULL WHERE id = ?",
            [food_id]
          );
          console.log(`Deal for food ID ${food_id} is now inactive.`);
        }
      }

      // Get food details for logging
      const [foodRows] = await connection.query(
        "SELECT name, unit FROM foods WHERE id = ?",
        [food_id]
      );
      const foodName = foodRows[0]?.name;
      const unit = foodRows[0]?.unit;

      // Log wallet transaction
      await connection.query(
        `INSERT INTO wallet_transactions 
         (user_id, order_id, amount, type, description, before_balance, after_balance, created_at) 
         VALUES (?, ?, ?, 'debit', ?, ?, ?, NOW())`,
        [
          user_id,
          orderId,
          totalAmount,
          `Order placed for ${foodName} (${quantity} ${unit})`,
          currentBalance,
          newBalance
        ]
      );

      await connection.commit();

      return {
        success: true,
        orderId,
        foodId: food_id,
        quantity,
        amount: totalAmount
      };

    } catch (error) {
      await connection.rollback();
      console.error(`Error processing order for food ID ${food_id}:`, error.message);
      return {
        success: false,
        error: error.message,
        foodId: food_id
      };
    } finally {
      if (connection) connection.release();
    }
  } catch (error) {
    console.error('Database connection error:', error.message);
    return {
      success: false,
      error: 'Database connection error',
      foodId: food_id
    };
  }
};

// Sequential processor for multiple items
export const processOrdersSequentially = async (products, user_id, orderDate) => {
  const results = [];
  
  for (const product of products) {
    // Process each item one by one
    const result = await placeOrder(product, user_id, orderDate);
    results.push(result);
    
    // Stop processing if an order fails
    if (!result?.success) {
      break;
    }
  }
  
  return results;
};

//admin panel One time order
export const oneTimeOrdersInCustomer = async (req: Request, res: Response) => {
  try {
    const { user_id, orderDate, productData } = req.body;

    if (!user_id || !orderDate || !productData) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const { discount_price, price, food_id, quantity } = productData;
    const productAmount = discount_price > 0 ? discount_price : price;
    const { foodName, unit } = await getFoodNameById(food_id);

    if (quantity <= 0) {
      return res
        .status(400)
        .json({ message: "Quantity must be greater than 0" });
    }

    if (productAmount <= 0) {
      return res.status(400).json({ message: "Invalid product amount" });
    }

    const totalAmount = productAmount * quantity;

    // Get current balance before deduction
    const [walletRows]: any = await db
      .promise()
      .query("SELECT balance FROM wallet_balances WHERE user_id = ?", [
        user_id,
      ]);
    const currentBalance = walletRows[0]?.balance || 0;

    // Deduct from wallet balance
    const { success, paymentId } = await deductFromWalletOneTimeOrder(
      user_id,
      totalAmount
    );
    if (!success || !paymentId) {
      console.log(`Failed to deduct from wallet for user ${user_id}`);
      return null;
    }

    const orderData = await addOrdersEntry(user_id, orderDate);
    if (!orderData?.orderId) {
      console.error("Failed to create order entry");
      return res.status(500).json({ message: "Failed to place order" });
    }

    // Log wallet transaction
    await logWalletOneTimeOrder({
      userId: user_id,
      orderId: orderData.orderId,
      beforeBalance: currentBalance,
      amount: totalAmount,
      orderDate: orderDate,
      afterBalance: currentBalance - totalAmount,
      foodName: foodName,
      quantity: quantity,
      unit: unit,
    });

    // Update order with wallet deduction info
    await updateOrderWalletInfo(orderData.orderId, paymentId);

    await addFoodOrderEntry(
      productAmount,
      quantity,
      food_id,
      orderData.orderId
    );

    return res.status(201).json({
      message: "Order placed successfully",
      orderId: orderData.orderId,
    });
  } catch (error) {
    console.error("Error placing order:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};
