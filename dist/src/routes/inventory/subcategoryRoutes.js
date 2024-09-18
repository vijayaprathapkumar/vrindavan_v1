"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const subcategoryController_1 = require("../../controllers/inventory/subcategoryController");
const subcategoryValidation_1 = require("../../validation/inventory/subcategoryValidation");
const router = express_1.default.Router();
router.get("/", subcategoryController_1.getSubCategoriesWithCategory);
router.post("/", subcategoryValidation_1.subCategoryValidation, subcategoryValidation_1.validate, subcategoryController_1.addSubCategory);
router.get("/:id", subcategoryValidation_1.subCategoryIdValidation, subcategoryValidation_1.validate, subcategoryController_1.getSubCategory);
router.put("/:id", subcategoryValidation_1.subCategoryIdValidation, subcategoryValidation_1.subCategoryValidation, subcategoryValidation_1.validate, subcategoryController_1.updateSubCategory);
router.delete("/:id", subcategoryValidation_1.subCategoryIdValidation, subcategoryValidation_1.validate, subcategoryController_1.deleteSubCategory);
exports.default = router;
