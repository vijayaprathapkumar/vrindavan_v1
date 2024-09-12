"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const subcategoryController_1 = require("../../controllers/inventory/subcategoryController");
const subcategoryValidation_1 = require("../../validation/inventory/subcategoryValidation");
const router = express_1.default.Router();
router.get("/", subcategoryController_1.getSubcategories);
router.post("/", subcategoryValidation_1.subcategoryValidation, subcategoryValidation_1.validate, subcategoryController_1.addSubcategory);
router.get("/:id", subcategoryValidation_1.subcategoryIdValidation, subcategoryValidation_1.validate, subcategoryController_1.getSubcategoryById);
router.put("/:id", subcategoryValidation_1.subcategoryIdValidation, subcategoryValidation_1.subcategoryValidation, subcategoryValidation_1.validate, subcategoryController_1.updateSubcategory);
router.delete("/:id", subcategoryValidation_1.subcategoryIdValidation, subcategoryValidation_1.validate, subcategoryController_1.deleteSubcategory);
exports.default = router;
