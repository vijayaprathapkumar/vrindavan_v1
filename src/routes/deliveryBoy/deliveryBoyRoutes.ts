import express from "express";
import {
  getDeliveryBoys,
  addDeliveryBoy,
  getDeliveryBoy,
  updateDeliveryBoy,
  deleteDeliveryBoy,
} from "../../controllers/deliveryBoy/deliveryBoyController";
import {
  deliveryBoyValidation,
  deliveryBoyIdValidation,
  validate,
} from "../../validation/deliveryBoy/deliveryBoyValidation";
import { verifyDeviceToken } from "../../middlewares/authMiddleware";

const router = express.Router();

// Define routes for delivery boys
router.get("/",verifyDeviceToken, getDeliveryBoys);
router.post("/", deliveryBoyValidation, validate,verifyDeviceToken, addDeliveryBoy);
router.get("/:id", deliveryBoyIdValidation, validate,verifyDeviceToken, getDeliveryBoy);
router.put(
  "/:id",
  deliveryBoyIdValidation,
  deliveryBoyValidation,
  validate,
  updateDeliveryBoy,verifyDeviceToken,
);
router.delete("/:id", deliveryBoyIdValidation,verifyDeviceToken, validate, deleteDeliveryBoy);

export default router;
