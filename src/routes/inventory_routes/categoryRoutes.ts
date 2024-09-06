import express from "express";
import {
  getCategories,
  addCategory,
  getCategory,
  updateCategory,
  deleteCategory
} from "../../controllers/inventory_controllers/categoryController";

const router = express.Router();

router.get("/", getCategories);
router.post("/", addCategory);
router.get("/:id", getCategory);
router.put("/:id", updateCategory);
router.delete("/:id", deleteCategory);

export default router;
