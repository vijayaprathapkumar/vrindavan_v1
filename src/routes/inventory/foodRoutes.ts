import express from 'express';
import {
  getFoods,
  addFood,
  getFood,
  updateFood,
  deleteFood
} from '../../controllers/inventory/foodController';
import {
  foodValidation,
  foodIdValidation,
  validate
} from '../../validation/inventory/foodValidation';

const router = express.Router();

router.get("/", getFoods);
router.post("/", foodValidation, validate, addFood);
router.get("/:id", foodIdValidation, validate, getFood);
router.put("/:id", foodIdValidation, foodValidation, validate, updateFood);
router.delete("/:id", foodIdValidation, validate, deleteFood);

export default router;
