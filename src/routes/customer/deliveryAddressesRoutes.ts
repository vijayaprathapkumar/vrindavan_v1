import express from "express";
import {
  fetchDeals,
  addDeal,
  fetchDealById,
  updateDeal,
  removeDeal,
} from "../../controllers/dealOfTheDay/dealOfTheDayController";
import { verifyDeviceToken } from "../../middlewares/authMiddleware";
import {
  deleteDeliveryAddress,
  getDeliveryAddresses,
  updateDeliveryAddress,
} from "../../controllers/customer/deliveryAddressesController";

const router = express.Router();

router.get("/", verifyDeviceToken, getDeliveryAddresses);

router.put("/:id", verifyDeviceToken, updateDeliveryAddress);

router.delete("/:id", verifyDeviceToken, deleteDeliveryAddress);

export default router;
