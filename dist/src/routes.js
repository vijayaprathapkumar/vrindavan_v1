"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authLogin_1 = __importDefault(require("./routes/authLoginRoutes/authLogin"));
const categoryRoutes_1 = __importDefault(require("./routes/inventoryRoutes/categoryRoutes"));
const subcategoryRoutes_1 = __importDefault(require("./routes/inventoryRoutes/subcategoryRoutes"));
const productRoutes_1 = __importDefault(require("./routes/inventoryRoutes/productRoutes"));
const productTypeRoutes_1 = __importDefault(require("./routes/inventoryRoutes/productTypeRoutes"));
const productBrandRoutes_1 = __importDefault(require("./routes/inventoryRoutes/productBrandRoutes"));
const customerRoutes_1 = __importDefault(require("./routes/customerRoutes/customerRoutes"));
const router = express_1.default.Router();
// Auth Login
router.use("/auth", authLogin_1.default);
// inventory Routes
router.use("/categories", categoryRoutes_1.default);
router.use("/subcategories", subcategoryRoutes_1.default);
router.use("/products", productRoutes_1.default);
router.use("/product_brands", productBrandRoutes_1.default);
router.use("/product_types", productTypeRoutes_1.default);
//Customers
router.use("/customers", customerRoutes_1.default);
exports.default = router;
