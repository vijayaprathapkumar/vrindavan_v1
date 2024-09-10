import express from "express";
import authLoginRoutes from "./routes/authLoginRoutes/authLogin";
import categoryRoutes from "./routes/inventoryRoutes/categoryRoutes";
import subcategoryRoutes from "./routes/inventoryRoutes/subcategoryRoutes";
import productRoutes from "./routes/inventoryRoutes/productRoutes";
import productTypeRoutes from "./routes/inventoryRoutes/productTypeRoutes";
import productBrandRoutes from "./routes/inventoryRoutes/productBrandRoutes";
import customerRoutes from "./routes/customerRoutes/customerRoutes";

const router = express.Router();

// Auth Login
router.use("/auth", authLoginRoutes);

// inventory Routes
router.use("/categories", categoryRoutes);
router.use("/subcategories", subcategoryRoutes);
router.use("/products", productRoutes);
router.use("/product_brands", productBrandRoutes);
router.use("/product_types", productTypeRoutes);

//Customers

router.use("/customers", customerRoutes);
export default router;
