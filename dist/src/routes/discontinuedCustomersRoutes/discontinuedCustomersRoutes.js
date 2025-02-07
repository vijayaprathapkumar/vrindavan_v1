"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../../middlewares/authMiddleware");
const discontinuedCustomersController_1 = require("../../controllers/discontinuedCustomersController/discontinuedCustomersController");
const router = express_1.default.Router();
// Route for fetching discontinued customers
router.get("/", authMiddleware_1.verifyDeviceToken, discontinuedCustomersController_1.fetchDiscontinuedCustomers);
exports.default = router;
