"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const productBrandController_1 = require("../../controllers/inventory/productBrandController");
const authMiddleware_1 = require("../../middlewares/authMiddleware");
const router = express_1.default.Router();
// Define routes for product brands
router.get("/", authMiddleware_1.verifyDeviceToken, productBrandController_1.fetchAllBrands);
router.post("/", authMiddleware_1.verifyDeviceToken, productBrandController_1.addBrand);
router.get("/:id", authMiddleware_1.verifyDeviceToken, productBrandController_1.fetchBrandById);
router.put("/:id", authMiddleware_1.verifyDeviceToken, productBrandController_1.UpdateBrand);
router.delete("/:id", authMiddleware_1.verifyDeviceToken, productBrandController_1.removeBrand);
exports.default = router;
