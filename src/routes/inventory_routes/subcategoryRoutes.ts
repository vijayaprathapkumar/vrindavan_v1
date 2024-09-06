import express from "express";
import {
  getSubcategories,
  addSubcategory,
  getSubcategoryById,
  updateSubcategory,
  deleteSubcategory,
} from "../../controllers/inventory_controllers/subcategoryController";

const router = express.Router();

router.get("/", getSubcategories);
router.post("/", addSubcategory);
router.get("/:id", getSubcategoryById);
router.put("/:id", updateSubcategory);
router.delete("/:id", deleteSubcategory);

export default router;
