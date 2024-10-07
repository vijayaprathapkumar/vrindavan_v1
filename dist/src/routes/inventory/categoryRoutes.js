"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const categoryController_1 = require("../../controllers/inventory/categoryController");
const categoryValidation_1 = require("../../validation/inventory/categoryValidation");
const authMiddleware_1 = require("../../middlewares/authMiddleware");
const router = express_1.default.Router();
// Define routes for categories
router.get('/', authMiddleware_1.verifyDeviceToken, categoryController_1.getCategories);
router.post('/', authMiddleware_1.verifyDeviceToken, categoryValidation_1.categoryValidation, categoryValidation_1.validate, categoryController_1.addCategory);
router.get('/:id', authMiddleware_1.verifyDeviceToken, categoryValidation_1.categoryIdValidation, categoryValidation_1.validate, categoryController_1.getCategory);
router.put('/:id', authMiddleware_1.verifyDeviceToken, categoryValidation_1.categoryIdValidation, categoryValidation_1.categoryValidation, categoryValidation_1.validate, categoryController_1.updateCategory);
router.delete('/:id', authMiddleware_1.verifyDeviceToken, categoryValidation_1.categoryIdValidation, categoryValidation_1.validate, categoryController_1.deleteCategory);
exports.default = router;
