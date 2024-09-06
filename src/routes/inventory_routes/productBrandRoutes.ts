import express from "express";
import {
  getProductBrands,
  addProductBrand,
  updateProductBrand,
  deleteProductBrand,
  getProductBrandById
} from "../../controllers/inventory_controllers/productBrandController";

const router = express.Router();

router.get("/", getProductBrands);
router.post("/", addProductBrand);
router.get("/:id", getProductBrandById); 
router.put("/:id", updateProductBrand);
router.delete("/:id", deleteProductBrand);

export default router;
