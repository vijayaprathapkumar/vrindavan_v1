"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/productRoutes.ts
const express_1 = __importDefault(require("express"));
const productController_1 = require("../../controllers/inventoryControllers/productController");
const productValidation_1 = require("../../validation/inventory/productValidation");
const router = express_1.default.Router();
router.post("/", productValidation_1.productValidation, productValidation_1.validate, productController_1.addProduct);
router.get("/", productController_1.getProducts);
router.get("/:id", productValidation_1.productIdValidation, productValidation_1.validate, productController_1.getProductById);
router.put("/:id", productValidation_1.productIdValidation, productValidation_1.productValidation, productValidation_1.validate, productController_1.updateProduct);
router.delete("/:id", productValidation_1.productIdValidation, productValidation_1.validate, productController_1.deleteProduct);
exports.default = router;
