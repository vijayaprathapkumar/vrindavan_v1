"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const foodController_1 = require("../../controllers/inventory/foodController");
const foodValidation_1 = require("../../validation/inventory/foodValidation");
const router = express_1.default.Router();
router.get("/", foodController_1.getFoods);
router.post("/", foodValidation_1.foodValidation, foodValidation_1.validate, foodController_1.addFood);
router.get("/:id", foodValidation_1.foodIdValidation, foodValidation_1.validate, foodController_1.getFood);
router.put("/:id", foodValidation_1.foodIdValidation, foodValidation_1.foodValidation, foodValidation_1.validate, foodController_1.updateFood);
router.delete("/:id", foodValidation_1.foodIdValidation, foodValidation_1.validate, foodController_1.deleteFood);
exports.default = router;
