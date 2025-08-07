import { Request, Response } from "express";
import { createResponse } from "../../utils/responseHandler";
import {
  cancelOneTimeOrderModel,
  cancelOrder,
  deletePlaceOrderById,
  getAllOrders,
  getAllOrdersWithOutUserId,
  getCalendarOneTimeOrdersModel,
  getCalendarWiseOrdersModel,
  getPlaceOrderById,
  getUpcomingOrdersModel,
  logWalletOneCancelTimeOrder,
  updateOneTimeOrders,
  updateSubscriptionOrders,
} from "../../models/orders/orderModel";
import { logWalletOneTimeOrder } from "../../models/placeOrder/placeOrderModels";
import { db } from "../../config/databaseConnection";

export const fetchAllOrders = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const userId = parseInt(req.params.userId);
  const limit = parseInt(req.query.limit as string) || 10;
  const page = parseInt(req.query.page as string) || 1;
  const searchTerm: string | null = req.query.searchTerm
    ? (req.query.searchTerm as string)
    : null;

  const startDate = req.query.startDate
    ? new Date(req.query.startDate as string)
    : undefined;
  const endDate = req.query.endDate
    ? new Date(req.query.endDate as string)
    : undefined;

  // Input validation
  if (isNaN(page) || page < 1) {
    return res.status(400).json(createResponse(400, "Invalid page number."));
  }
  if (isNaN(limit) || limit < 1) {
    return res.status(400).json(createResponse(400, "Invalid limit number."));
  }

  try {
    const { total, placeOrders } = await getAllOrders(
      userId,
      page,
      limit,
      startDate,
      endDate,
      searchTerm
    );

    const totalPages = Math.ceil(total / limit);

    return res.json(
      createResponse(200, "Place orders fetched successfully.", {
        placeOrders,
        currentPage: page,
        limit,
        totalPages,
        totalRecords: total,
      })
    );
  } catch (error) {
    console.error("Error fetching place orders:", error);
    return res
      .status(500)
      .json(createResponse(500, "Failed to fetch place orders."));
  }
};

export const fetchAllOrdersWithOutUserID = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  const routeId = req.query.route_id
    ? parseInt(req.query.route_id as string)
    : null;
  const hubId = req.query.hub_id ? parseInt(req.query.hub_id as string) : null;
  const localityId = req.query.locality_id
    ? parseInt(req.query.locality_id as string)
    : null;
  const searchTerm = req.query.searchTerm
    ? (req.query.searchTerm as string)
    : null;
  const approveStatus = req.query.approveStatus
    ? (req.query.approveStatus as string)
    : "All";
  const orderType = req.query.orderType
    ? (req.query.orderType as string)
    : null;

  const deliveryBoyId = req.query.deliveryBoyId
    ? parseInt(req.query.deliveryBoyId as string)
    : null;

  const productId = req.query.productId
    ? parseInt(req.query.productId as string)
    : null;

  const startDate = req.query.startDate
    ? new Date(req.query.startDate as string)
    : undefined;
  const endDate = req.query.endDate
    ? new Date(req.query.endDate as string)
    : undefined;

  const walletFilter = req.query.walletOption
    ? (req.query.walletOption as string)
    : null;
  const sortField = (req.query.sortField as string) || "";
  const sortOrder = (req.query.sortOrder as string) || "DESC";

  // Input validation
  if (isNaN(page) || page < 1) {
    return res.status(400).json(createResponse(400, "Invalid page number."));
  }
  if (isNaN(limit) || limit < 1) {
    return res.status(400).json(createResponse(400, "Invalid limit number."));
  }

  try {
    const { total, placeOrders } = await getAllOrdersWithOutUserId(
      page,
      limit,
      startDate,
      endDate,
      searchTerm,
      routeId,
      hubId,
      localityId,
      productId,
      approveStatus,
      orderType,
      deliveryBoyId,
      walletFilter,
      sortField,
      sortOrder
    );

    const totalPages = Math.ceil(total / limit);

    return res.status(200).json(
      createResponse(200, "Orders fetched successfully.", {
        placeOrders,
        currentPage: page,
        limit,
        totalPages,
        totalCount: total,
      })
    );
  } catch (error) {
    console.error("Error fetching orders:", error);
    return res
      .status(500)
      .json(createResponse(500, "An error occurred while fetching orders."));
  }
};

export const fetchOrderById = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const id = parseInt(req.params.id);
  const searchTerm = req.query.searchTerm
    ? (req.query.searchTerm as string)
    : null;

  try {
    const placeOrder = await getPlaceOrderById(Number(id), searchTerm);

    if (!placeOrder) {
      return res
        .status(404)
        .json(createResponse(404, "Place order not found."));
    }

    return res.json(
      createResponse(200, "Place order fetched successfully.", { placeOrder })
    );
  } catch (error) {
    console.error("Error fetching place order:", error);
    return res
      .status(500)
      .json(createResponse(500, "Failed to fetch place order."));
  }
};

//update  Qnty Change
export const updateOrderQty = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { orderId, quantity, orderDate, orderType, subscriptionId, userId } =
    req.body;

  const currentDate = new Date().toISOString().split("T")[0]; // 'YYYY-MM-DD'

  const effectiveOrderDate = orderDate;

  try {
    if (
      orderType === 1 ||
      (orderType === 2 && effectiveOrderDate === currentDate)
    ) {
      await updateOneTimeOrders(orderId, quantity, userId);
    } else if (orderType === 2) {
      await updateSubscriptionOrders(subscriptionId, quantity, orderDate);
    } else {
      return res.status(400).json({ message: "Invalid order type." });
    }

    return res.json({ message: "Order updated successfully." });
  } catch (error) {
    console.error("Error updating order:", error);
    return res.status(500).json({ message: "Failed to update order." });
  }
};

// Delete a place order by ID
export const removeOrder = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;

  if (isNaN(Number(id)) || Number(id) <= 0) {
    return res
      .status(400)
      .json(createResponse(400, "Invalid ID. It must be a positive number."));
  }

  try {
    await deletePlaceOrderById(Number(id));
    return res.json(createResponse(200, "Order deleted successfully.", null));
  } catch (error) {
    console.error("Error deleting place order:", error);
    return res
      .status(500)
      .json(createResponse(500, "Failed to delete place order."));
  }
};

export const cancelSubscriptionOrder = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { subscriptionId, cancelOrderDate, reason, otherReason } = req.body;

  if (!subscriptionId || !cancelOrderDate) {
    res
      .status(400)
      .json({ message: "Subscription ID and cancelOrderDate are required." });
    return;
  }

  try {
    const formattedDate = new Date(cancelOrderDate).toISOString().split("T")[0];
    await cancelOrder(subscriptionId, formattedDate, reason, otherReason);
    res
      .status(200)
      .json({ message: "Subscription order canceled successfully." });
  } catch (error) {
    console.error("Error canceling subscription order:", error);
    res.status(500).json({
      message: "Failed to cancel subscription order.",
      error: error.message,
    });
  }
};

export const getUpcomingOrders = async (req: Request, res: Response) => {
  const userId = parseInt(req.params.id);
  const dateParam = req.query.date || req.body.date; // Accepts date from query or body
  const currentDate = dateParam ? new Date(dateParam) : new Date(); // Use provided date or current date

  const { page = 1, limit = 10 } = req.query;
  const currentPage = parseInt(page as string, 10);
  const recordsPerPage = parseInt(limit as string, 10);

  // Validate userId and date
  if (isNaN(userId)) {
    return res.status(400).json(createResponse(400, "Invalid user ID."));
  }

  if (isNaN(currentDate.getTime())) {
    return res.status(400).json(createResponse(400, "Invalid date format."));
  }

  try {
    const allUpcomingOrders = await getUpcomingOrdersModel(userId, currentDate);

    const totalRecord = allUpcomingOrders.length;

    const totalPages = Math.ceil(totalRecord / recordsPerPage);

    const upcomingOrders = allUpcomingOrders.slice(
      (currentPage - 1) * recordsPerPage,
      currentPage * recordsPerPage
    );

    res.status(200).json(
      createResponse(200, "Upcoming orders fetched successfully.", {
        upcomingOrders,
        totalRecord,
        currentPage,
        limit: recordsPerPage,
        totalPages,
      })
    );
  } catch (error) {
    console.error("Error fetching upcoming orders:", error);
    res
      .status(500)
      .json(
        createResponse(500, "Failed to fetch upcoming orders.", error.message)
      );
  }
};

export const cancelOneTimeOrder = async (req: Request, res: Response) => {
  const { orderId } = req.params;

  // Validate orderId
  if (!orderId || isNaN(parseInt(orderId))) {
    return res.status(400).json(createResponse(400, "Invalid order ID."));
  }

  try {
    const now = new Date();
    const nineThirtyPM = new Date();
    nineThirtyPM.setHours(21, 30, 0, 0); // Set time to 9:30 PM

    if (now > nineThirtyPM) {
      return res
        .status(403)
        .json(
          createResponse(403, "You cannot cancel the order after 9:30 PM.")
        );
    }

    // Get connection from pool
    const connection = await db.promise().getConnection();
    await connection.beginTransaction();

    try {
      // First, get order details including user_id and order_type
      const [orderRows]: any = await connection.query(
        "SELECT * FROM orders WHERE id = ?",
        [orderId]
      );

      if (orderRows.length === 0) {
        await connection.rollback();
        connection.release();
        return res.status(404).json(createResponse(404, "Order not found."));
      }

      const order = orderRows[0];
      const userId = order.user_id;
      const orderType = order.order_type;

      // Get all food items for this order with food names from foods table
      const [foodOrderRows]: any = await connection.query(
        `SELECT fo.*, f.name as food_name ,f.unit as food_unit
         FROM food_orders fo
         JOIN foods f ON fo.food_id = f.id
         WHERE fo.order_id = ?`,
        [order.id]
      );

      if (foodOrderRows.length === 0) {
        await connection.rollback();
        connection.release();
        return res
          .status(404)
          .json(createResponse(404, "No food items found for this order."));
      }

      // Only process wallet refund if order type is not 2
      if (orderType !== "2") {
        // Calculate total amount from food items (price * quantity)
        const amount = foodOrderRows.reduce(
          (total: number, item: any) => total + item.price * item.quantity,
          0
        );

        // Validate amount
        if (isNaN(amount)) {
          await connection.rollback();
          connection.release();
          return res
            .status(400)
            .json(createResponse(400, "Invalid order amount."));
        }

        // Get current wallet balance
        const [walletRows]: any = await connection.query(
          "SELECT balance FROM wallet_balances WHERE user_id = ?",
          [userId]
        );

        if (walletRows.length === 0) {
          await connection.rollback();
          connection.release();
          return res
            .status(404)
            .json(createResponse(404, "Wallet not found for this user."));
        }

        const currentBalance = parseFloat(walletRows[0].balance);
        const newBalance = currentBalance + amount;

        // Update wallet balance - ensure values are properly formatted
        await connection.query(
          "UPDATE wallet_balances SET balance = ?, updated_at = NOW() WHERE user_id = ?",
          [newBalance.toFixed(2), userId]
        );

        // Log the wallet transaction
        const today = new Date();
        const formattedDate = order?.order_date;

        const formattedDescDate = `${today
          .getDate()
          .toString()
          .padStart(2, "0")}-${(today.getMonth() + 1)
          .toString()
          .padStart(2, "0")}-${today.getFullYear()}`;
        // Prepare description with food items
        const foodNames = foodOrderRows
          .map((item: any) => `${item.food_name} ${item.food_unit} x ${item.quantity}`)
          .join(", ");

        const description = `₹${amount.toFixed(
          2
        )} Refunded - cancelled ${foodNames} (One Time Order | Order Id: ${orderId}). Balance ₹${currentBalance.toFixed(
          2
        )} → ₹${newBalance.toFixed(2)}`;

        await logWalletOneCancelTimeOrder({
          userId,
          orderId: parseInt(orderId),
          beforeBalance: currentBalance,
          amount,
          orderDate: formattedDate,
          afterBalance: newBalance,
          description,
          foodName: foodOrderRows[0].food_name,
          quantity: foodOrderRows[0].quantity,
        });
      }

      // Update order status (active = 0) for all order types
      await connection.query(
        "UPDATE orders SET active = 0, updated_at = NOW() WHERE id = ?",
        [orderId]
      );

      await connection.commit();
      connection.release();

      res
        .status(200)
        .json(
          createResponse(
            200,
            orderType === 2 
              ? "Order canceled successfully (no refund for this order type)." 
              : "Order canceled successfully and amount refunded to wallet."
          )
        );
    } catch (error) {
      await connection.rollback();
      connection.release();
      console.error("Transaction error:", error);
      throw error;
    }
  } catch (error) {
    console.error("Error canceling order:", error);
    res
      .status(500)
      .json(
        createResponse(
          500,
          "Failed to cancel order.",
          error instanceof Error ? error.message : "Unknown error"
        )
      );
  }
};
export const getCalendarWiseOrders = async (req: Request, res: Response) => {
  const userId = parseInt(req.params.userId, 10);
  const { startDate, endDate } = req.query;

  // Validate userId and date parameters
  if (isNaN(userId)) {
    return res.status(400).json(createResponse(400, "Invalid user ID."));
  }

  if (!startDate || !endDate) {
    return res
      .status(400)
      .json(createResponse(400, "startDate and endDate are required."));
  }

  const parsedStartDate = new Date(startDate as string);
  const parsedEndDate = new Date(endDate as string);

  if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
    return res.status(400).json(createResponse(400, "Invalid date format."));
  }

  try {
    const calendarData = await getCalendarWiseOrdersModel(
      userId,
      parsedStartDate,
      parsedEndDate
    );

    res.status(200).json(
      createResponse(200, "Calendar-wise orders fetched successfully.", {
        calendarData,
      })
    );
  } catch (error) {
    console.error("Error fetching calendar-wise orders:", error);
    res
      .status(500)
      .json(
        createResponse(
          500,
          "Failed to fetch calendar-wise orders.",
          error.message
        )
      );
  }
};

export const getCalendarWiseOneTimeOrders = async (
  req: Request,
  res: Response
) => {
  const userId = parseInt(req.params.userId, 10);
  const { startDate, endDate } = req.query;

  // Validate userId and date parameters
  if (isNaN(userId)) {
    return res.status(400).json(createResponse(400, "Invalid user ID."));
  }

  if (!startDate || !endDate) {
    return res
      .status(400)
      .json(createResponse(400, "startDate and endDate are required."));
  }

  const parsedStartDate = new Date(startDate as string);
  const parsedEndDate = new Date(endDate as string);

  if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
    return res.status(400).json(createResponse(400, "Invalid date format."));
  }

  try {
    const calendarData = await getCalendarOneTimeOrdersModel(
      userId,
      parsedStartDate,
      parsedEndDate
    );
    const filteredResults = calendarData.filter(
      (result) => result.order_id !== null
    );
    res.status(200).json(
      createResponse(
        200,
        "Calendar-wise One time orders fetched successfully.",
        {
          calendarOneTimeData:
            filteredResults.length > 0 ? filteredResults : [],
        }
      )
    );
  } catch (error) {
    console.error("Error fetching calendar-wise orders:", error);
    res
      .status(500)
      .json(
        createResponse(
          500,
          "Failed to fetch calendar-wise orders.",
          error.message
        )
      );
  }
};
