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
        await placeMultipleOrders(item, userId, orderDate);
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

const placeOrder = async (productData, user_id, orderDate) => {
  const { price, food_id, quantity, discount_price } = productData;
  if (quantity <= 0) {
    console.log(`Skipping food ID ${food_id} due to zero quantity.`);
    return;
  }

  // Start with discount_price if available
  let productAmount = discount_price ?? null;

  // If no discount_price, check for an active deal
  if (productAmount === null) {
    const deal = await getDealByFoodId(food_id);

    if (deal && deal.quantity > 0) {
      productAmount = deal.offer_price;

      await updateFoodDiscountPrice(food_id, deal.offer_price);

      // Add order only if valid amount
      if (productAmount > 0) {
        const orderData = await addOrdersEntry(user_id, orderDate);
        if (orderData?.orderId) {
          const totalAmount = productAmount * quantity;

          // Get current balance before deduction
          const [walletRows]: any = await db
            .promise()
            .query("SELECT balance FROM wallet_balances WHERE user_id = ?", [
              user_id,
            ]);
          const currentBalance = walletRows[0]?.balance || 0;

          const { success, paymentId } = await deductFromWalletOneTimeOrder(
            user_id,
            totalAmount
          );
          if (!success || !paymentId) {
            console.log(`Failed to deduct from wallet for user ${user_id}`);
            return null;
          }

          const { foodName, unit } = await getFoodNameById(food_id);
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
          await updateOrderWalletInfo(orderData.orderId, paymentId);

          await addFoodOrderEntry(
            productAmount,
            quantity,
            food_id,
            orderData.orderId
          );

          const updatedDeal = (await updateDealQuantity(
            food_id,
            quantity
          )) as any;

          if (updatedDeal?.quantity === 0) {
            await resetFoodDiscountPrice(food_id);
            console.log(`Deal for food ID ${food_id} is now inactive.`);
          }

          return;
        }
      }

      console.log("Failed to place order for item: " + food_id);
      return null;
    }
  }

  // If still no discount or deal, use regular price
  if (productAmount === null) {
    productAmount = price;
  }

  // Proceed with order using the determined price
  if (productAmount > 0) {
    const orderData = await addOrdersEntry(user_id, orderDate);

    if (orderData?.orderId) {
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
      const { foodName, unit } = await getFoodNameById(food_id);
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
      return;
    }
  }

  console.log("Failed to place order for item: " + food_id);
  return null;
};

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
