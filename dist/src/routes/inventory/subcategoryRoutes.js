"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const subcategoryController_1 = require("../../controllers/inventory/subcategoryController");
const subcategoryValidation_1 = require("../../validation/inventory/subcategoryValidation");
const authMiddleware_1 = require("../../middlewares/authMiddleware");
const router = express_1.default.Router();
router.get("/", authMiddleware_1.verifyDeviceToken, subcategoryController_1.getSubCategoriesWithCategory);
router.post("/", authMiddleware_1.verifyDeviceToken, subcategoryValidation_1.subCategoryValidation, subcategoryValidation_1.validate, subcategoryController_1.addSubCategory);
router.get("/:id", authMiddleware_1.verifyDeviceToken, subcategoryValidation_1.subCategoryIdValidation, subcategoryValidation_1.validate, subcategoryController_1.getSubCategory);
router.put("/:id", authMiddleware_1.verifyDeviceToken, subcategoryValidation_1.subCategoryIdValidation, subcategoryValidation_1.subCategoryValidation, subcategoryValidation_1.validate, subcategoryController_1.updateSubCategory);
router.delete("/:id", authMiddleware_1.verifyDeviceToken, subcategoryValidation_1.subCategoryIdValidation, subcategoryValidation_1.validate, subcategoryController_1.deleteSubCategory);
exports.default = router;
