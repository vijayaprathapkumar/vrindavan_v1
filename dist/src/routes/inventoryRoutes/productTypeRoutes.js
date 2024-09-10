"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const productTypeController_1 = require("../../controllers/inventoryControllers/productTypeController");
const productTypeValidation_1 = require("../../validation/inventory/productTypeValidation");
const router = express_1.default.Router();
router.get("/", productTypeController_1.getProductTypes);
router.post("/", productTypeValidation_1.productTypeValidation, productTypeValidation_1.validate, productTypeController_1.addProductType);
router.get("/:id", productTypeValidation_1.productTypeIdValidation, productTypeValidation_1.validate, productTypeController_1.getProductTypeById);
router.put("/:id", productTypeValidation_1.productTypeIdValidation, productTypeValidation_1.productTypeValidation, productTypeValidation_1.validate, productTypeController_1.updateProductType);
router.delete("/:id", productTypeValidation_1.productTypeIdValidation, productTypeValidation_1.validate, productTypeController_1.deleteProductType);
exports.default = router;
