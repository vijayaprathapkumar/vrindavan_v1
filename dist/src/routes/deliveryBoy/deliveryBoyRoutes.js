"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const deliveryBoyController_1 = require("../../controllers/deliveryBoy/deliveryBoyController");
const deliveryBoyValidation_1 = require("../../validation/deliveryBoy/deliveryBoyValidation");
const router = express_1.default.Router();
// Define routes for delivery boys
router.get("/", deliveryBoyController_1.getDeliveryBoys);
router.post("/", deliveryBoyValidation_1.deliveryBoyValidation, deliveryBoyValidation_1.validate, deliveryBoyController_1.addDeliveryBoy);
router.get("/:id", deliveryBoyValidation_1.deliveryBoyIdValidation, deliveryBoyValidation_1.validate, deliveryBoyController_1.getDeliveryBoy);
router.put("/:id", deliveryBoyValidation_1.deliveryBoyIdValidation, deliveryBoyValidation_1.deliveryBoyValidation, deliveryBoyValidation_1.validate, deliveryBoyController_1.updateDeliveryBoy);
router.delete("/:id", deliveryBoyValidation_1.deliveryBoyIdValidation, deliveryBoyValidation_1.validate, deliveryBoyController_1.deleteDeliveryBoy);
exports.default = router;
