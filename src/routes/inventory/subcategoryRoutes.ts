import express from "express";
import { verifyDeviceToken } from "../../middlewares/authMiddleware";
import {
  getSubcategories,
  addSubcategory,
  getSubcategory,
  updateSubcategory,
  deleteSubcategory,
} from "../../controllers/inventory/subcategoryController";

const router = express.Router();

router.get("/", verifyDeviceToken, getSubcategories);

router.post("/", verifyDeviceToken, addSubcategory);

router.get("/:id", verifyDeviceToken, getSubcategory);

router.put("/:id", verifyDeviceToken, updateSubcategory);

router.delete("/:id", verifyDeviceToken, deleteSubcategory);

export default router;
