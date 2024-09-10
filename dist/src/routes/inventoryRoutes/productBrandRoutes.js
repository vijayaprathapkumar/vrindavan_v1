"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const productBrandController_1 = require("../../controllers/inventoryControllers/productBrandController");
const productBrandValidation_1 = require("../../validation/inventory/productBrandValidation");
const router = express_1.default.Router();
router.get("/", productBrandController_1.getProductBrands);
router.post("/", productBrandValidation_1.brandValidation, productBrandValidation_1.validate, productBrandController_1.addProductBrand);
router.get("/:id", productBrandValidation_1.brandIdValidation, productBrandValidation_1.validate, productBrandController_1.getProductBrandById);
router.put("/:id", productBrandValidation_1.brandIdValidation, productBrandValidation_1.brandValidation, productBrandValidation_1.validate, productBrandController_1.updateProductBrand);
router.delete("/:id", productBrandValidation_1.brandIdValidation, productBrandValidation_1.validate, productBrandController_1.deleteProductBrand);
exports.default = router;
