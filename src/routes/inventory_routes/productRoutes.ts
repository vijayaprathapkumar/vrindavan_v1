import express from "express";
import {
  getProductById,
  addProduct,
  getProducts,
  updateProduct,
  deleteProduct
} from "../../controllers/inventory_controllers/productController";

const router = express.Router();

router.post("/", addProduct);
router.get("/", getProducts);
router.get("/:id", getProductById);
router.put("/:id", updateProduct);   // Add this line
router.delete("/:id", deleteProduct); // Add this line

export default router;
