"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const customerController_1 = require("../../controllers/customer/customerController");
const authMiddleware_1 = require("../../middlewares/authMiddleware");
const router = express_1.default.Router();
router.get("/", authMiddleware_1.verifyDeviceToken, customerController_1.getCustomers);
router.post("/", authMiddleware_1.verifyDeviceToken, customerController_1.addCustomer);
router.get("/:id", authMiddleware_1.verifyDeviceToken, customerController_1.getCustomer);
router.put("/:id", authMiddleware_1.verifyDeviceToken, customerController_1.updateCustomer);
router.delete("/:id", customerController_1.deleteCustomer);
exports.default = router;
