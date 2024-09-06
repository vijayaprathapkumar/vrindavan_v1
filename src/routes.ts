import express from "express";
import authLoginRoutes from "./routes/authLogin_routes/authLogin";
import categoryRoutes from "./routes/inventory_routes/categoryRoutes";
import subcategoryRoutes from "./routes/inventory_routes/subcategoryRoutes";
import productRoutes from "./routes/inventory_routes/productRoutes";
import productTypeRoutes from "./routes/inventory_routes/productTypeRoutes";
import productBrandRoutes from "./routes/inventory_routes/productBrandRoutes";

const router = express.Router();

// Auth Login
router.use("/auth", authLoginRoutes);

// inventory Routes
router.use("/categories", categoryRoutes);
router.use("/subcategories", subcategoryRoutes);
router.use("/products", productRoutes);
router.use("/product_brands", productBrandRoutes);
router.use("/product_types", productTypeRoutes);

export default router;
