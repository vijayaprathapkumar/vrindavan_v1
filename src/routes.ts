import express from "express";
import authLoginRoutes from "./routes/authLogin";
import categoryRoutes from "./routes/categoryRoutes";
import subcategoryRoutes from "./routes/subcategoryRoutes";
import productRoutes from "./routes/productRoutes";
import productTypeRoutes from "./routes/productTypeRoutes";
import productBrandRoutes from "./routes/productBrandRoutes";

const router = express.Router();

router.use('/auth', authLoginRoutes);
router.use('/categories', categoryRoutes);
router.use('/subcategories', subcategoryRoutes);
router.use('/products', productRoutes);
router.use('/product_brands', productBrandRoutes);
router.use('/product_types', productTypeRoutes);

export default router;
