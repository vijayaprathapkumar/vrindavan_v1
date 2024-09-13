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

const router = express.Router();

// Define routes for delivery boys
router.get("/", getDeliveryBoys);
router.post("/", deliveryBoyValidation, validate, addDeliveryBoy);
router.get("/:id", deliveryBoyIdValidation, validate, getDeliveryBoy);
router.put(
  "/:id",
  deliveryBoyIdValidation,
  deliveryBoyValidation,
  validate,
  updateDeliveryBoy
);
router.delete("/:id", deliveryBoyIdValidation, validate, deleteDeliveryBoy);

export default router;
