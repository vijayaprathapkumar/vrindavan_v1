"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const placeOrderController_1 = require("../../controllers/placeOrder/placeOrderController");
const router = express_1.default.Router();
router.get("/:userId", placeOrderController_1.fetchPlaceOrders);
router.post("/", placeOrderController_1.addPlaceOrderController);
router.put("/:id", placeOrderController_1.updatePlaceOrderController);
router.delete("/:id", placeOrderController_1.removePlaceOrder);
exports.default = router;
