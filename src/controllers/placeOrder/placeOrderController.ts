import { Request, Response } from "express";
import {
  deleteAllCartItemsByUserId,
  addOrdersEntry,
  addFoodOrderEntry,
  getCartItemsByUserId,
} from "../../models/placeOrder/placeOrderModels";
import { createResponse } from "../../utils/responseHandler";
import { getDealByFoodId, updateDealQuantity } from "../../models/dealOfTheDay/dealOfTheDayModel";


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

const placeOrder = async (productData, user_id, orderDate) => {
  const { price, food_id, quantity } = productData;

  const deal = await getDealByFoodId(food_id);

  let productAmount;
  if (deal && deal.quantity > 0) {
    productAmount = deal.offer_price; 
  } else {
    productAmount = price; 
  }

  if (productAmount > 0) {
    const orderData = await addOrdersEntry(user_id, orderDate);

    if (orderData?.orderId) {
      await addFoodOrderEntry(productAmount, quantity, food_id, orderData.orderId);

      if (deal && deal.quantity > 0) {
        const updatedDeal = await updateDealQuantity(food_id, quantity);
        if (updatedDeal?.status === 0) { 
          console.log(`Deal for food ID ${food_id} is now inactive.`);
        }
      }
      return;
    }
  }

  console.log("Failed to place order for item: " + food_id);
  return null;
};



//admin panel One time order

export const oneTimeOrdersInCustomer = async (req: any, res: any) => {
  try {
    const { user_id, orderDate, productData } = req.body; 
    if (!user_id || !orderDate || !productData) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const { discount_price, price, food_id, quantity } = productData;
    const productAmount = discount_price > 0 ? discount_price : price;  

    if (productAmount <= 0) {
      return res.status(400).json({ message: "Invalid product amount" });
    }

    const orderData = await addOrdersEntry(user_id, orderDate);
    if (orderData?.orderId) {
      await addFoodOrderEntry(
        productAmount,
        quantity,
        food_id,
        orderData.orderId
      );
      return res.status(201).json({ message: "Order placed successfully", orderId: orderData.orderId });
    } else {
      console.error("Failed to create order entry");
      return res.status(500).json({ message: "Failed to place order" });
    }
  } catch (error) {
    console.error("Error placing order:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};


