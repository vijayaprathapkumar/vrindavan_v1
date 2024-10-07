import express from "express";
import * as foodController from "../../controllers/inventory/foodController";
import { validateFood } from "../../validation/inventory/foodValidation";
import { verifyDeviceToken } from "../../middlewares/authMiddleware";

const router = express.Router();

router.get("/",verifyDeviceToken, foodController.getAllFoods);
router.get("/:id",verifyDeviceToken, foodController.getFoodById);
router.post("/", verifyDeviceToken,validateFood, foodController.createFood);
router.put("/:id",verifyDeviceToken, validateFood, foodController.updateFood);
router.delete("/:id",verifyDeviceToken, foodController.deleteFood);

export default router;
