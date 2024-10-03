"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ordersController_1 = require("../../controllers/orders-v1/ordersController");
const router = express_1.default.Router();
router.get("/:userId", ordersController_1.fetchOrders);
router.get("/by/:id", ordersController_1.fetchOrderById); // GET fetch an order by ID
router.put("/:id", ordersController_1.updateOrderController); // PUT update an order
router.delete("/:id", ordersController_1.removeOrder); // DELETE an order by ID
exports.default = router;
