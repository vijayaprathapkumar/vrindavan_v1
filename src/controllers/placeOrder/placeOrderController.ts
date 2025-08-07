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
// Controller Function — Place Order and Clear Cart
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

    // Place multiple orders (passing cartItems array directly)
    await placeMultipleOrders(cartItems, userId, orderDate);

    // After placing all orders, clear the cart
    await deleteAllCartItemsByUserId(userId);

    return res
      .status(201)
      .json(
        createResponse(
          201,
          "Orders placed successfully, cart cleared, and wallet updated.",
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

// Function to Place a Single Product Order
const placeOrder = async (productData, user_id, orderDate) => {
  const { price, food_id, quantity, discount_price, track_inventory } =
    productData;

  if (quantity <= 0) {
    console.log(`Skipping food ID ${food_id} due to zero quantity.`);
    return;
  }

  let finalQuantity = quantity;

  try {
    if (track_inventory === "1") {
      const [stockRows]: any = await db
        .promise()
        .query(
          "SELECT COALESCE(SUM(amount), 0) AS stockCount FROM stock_mutations WHERE stockable_id = ?",
          [food_id]
        );

      const availableStock = stockRows[0]?.stockCount || 0;

      if (availableStock <= 0) {
        console.log(`Skipping food ID ${food_id} - out of stock.`);
        return;
      }

      if (finalQuantity > availableStock) {
        console.log(
          `Reducing quantity for food ID ${food_id} from ${finalQuantity} to ${availableStock} due to stock limits.`
        );
        finalQuantity = availableStock;
      }
    }

    let productAmount = discount_price ?? null;

    if (productAmount === null) {
      const deal = await getDealByFoodId(food_id);
      if (deal && deal.quantity > 0) {
        productAmount = deal.offer_price;
        await updateFoodDiscountPrice(food_id, deal.offer_price);
      }
    }

    if (productAmount === null) {
      productAmount = price;
    }

    if (!productAmount || productAmount <= 0) {
      console.log(`Invalid product amount for food ID ${food_id}`);
      return;
    }

    const [walletRows]: any = await db
      .promise()
      .query("SELECT balance FROM wallet_balances WHERE user_id = ?", [
        user_id,
      ]);
    const currentBalance = walletRows[0]?.balance || 0;

    const maxAffordableQty = Math.floor(currentBalance / productAmount);

    if (maxAffordableQty <= 0) {
      console.log(
        `Insufficient wallet balance for even 1 unit of food ID ${food_id}`
      );
      return;
    }

    if (finalQuantity > maxAffordableQty) {
      console.log(
        `Reducing quantity for food ID ${food_id} from ${finalQuantity} to ${maxAffordableQty} due to wallet balance.`
      );
      finalQuantity = maxAffordableQty;
    }

    const totalAmount = productAmount * finalQuantity;

    const orderData = await addOrdersEntry(user_id, orderDate);
    if (!orderData?.orderId) {
      console.log(`Failed to create order entry for food ID ${food_id}`);
      return;
    }

    const { success, paymentId } = await deductFromWalletOneTimeOrder(
      user_id,
      totalAmount
    );
    if (!success || !paymentId) {
      console.log(`Failed to deduct from wallet for user ${user_id}`);
      return;
    }

    await addFoodOrderEntry(
      productAmount,
      finalQuantity,
      food_id,
      orderData.orderId
    );

    const { foodName, unit } = await getFoodNameById(food_id);
    await logWalletOneTimeOrder({
      userId: user_id,
      orderId: orderData.orderId,
      beforeBalance: currentBalance,
      amount: totalAmount,
      orderDate: orderDate,
      afterBalance: currentBalance - totalAmount,
      foodName: foodName,
      quantity: finalQuantity,
      unit: unit,
    });

    await updateOrderWalletInfo(orderData.orderId, paymentId);

    const updatedDeal = await updateDealQuantity(food_id, finalQuantity);
    if (updatedDeal?.quantity === 0) {
      await resetFoodDiscountPrice(food_id);
      console.log(`Deal for food ID ${food_id} is now inactive.`);
    }

    console.log(
      `Order placed successfully for food ID ${food_id} with quantity ${finalQuantity}`
    );
  } catch (error) {
    console.error(`Error placing order for food ID ${food_id}:`, error);
  }
};

// Function to Place Multiple Orders Sequentially
const placeMultipleOrders = async (products, user_id, orderDate) => {
  for (const productData of products) {
    await placeOrder(productData, user_id, orderDate);
  }
  console.log("All orders processed.");
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
