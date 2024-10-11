import express from "express";
import * as foodController from "../../controllers/inventory/foodController";
import { validateFood } from "../../validation/inventory/foodValidation";
import { verifyDeviceToken } from "../../middlewares/authMiddleware";

const router = express.Router();

router.get("/", verifyDeviceToken, foodController.fetchAllFoods);
router.get("/:id", verifyDeviceToken, foodController.fetchFoodById);
router.post("/", verifyDeviceToken, validateFood, foodController.addFood);
router.put("/:id", verifyDeviceToken, validateFood, foodController.modifyFood);
router.delete("/:id", verifyDeviceToken, foodController.removeFood);

export default router;
