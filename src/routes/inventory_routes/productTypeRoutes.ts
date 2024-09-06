import express from "express";
import {
  getProductTypes,
  addProductType,
  getProductTypeById,
  updateProductType,
  deleteProductType
} from "../../controllers/inventory_controllers/productTypeController";

const router = express.Router();

router.get("/", getProductTypes);
router.post("/", addProductType);
router.get("/:id", getProductTypeById);
router.put("/:id", updateProductType);
router.delete("/:id", deleteProductType);

export default router;
