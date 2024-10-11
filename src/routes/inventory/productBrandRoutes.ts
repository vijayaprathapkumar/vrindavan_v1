import express from "express";
import {
  fetchAllBrands,
  addBrand,
  fetchBrandById,
  UpdateBrand,
  removeBrand,
} from "../../controllers/inventory/productBrandController";

import { verifyDeviceToken } from "../../middlewares/authMiddleware";

const router = express.Router();

// Define routes for product brands
router.get("/", verifyDeviceToken, fetchAllBrands);
router.post("/", verifyDeviceToken, addBrand);
router.get("/:id", verifyDeviceToken, fetchBrandById);
router.put("/:id", verifyDeviceToken, UpdateBrand);
router.delete("/:id", verifyDeviceToken, removeBrand);

export default router;
