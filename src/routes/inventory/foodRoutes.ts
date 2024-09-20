import express from "express";
import * as foodController from "../../controllers/inventory/foodController";
import { validateFood } from "../../validation/inventory/foodValidation";

const router = express.Router();

router.get("/", foodController.getAllFoods);
router.get("/:id", foodController.getFoodById);
router.post("/", validateFood, foodController.createFood);
router.put("/:id", validateFood, foodController.updateFood);
router.delete("/:id", foodController.deleteFood);

export default router;
