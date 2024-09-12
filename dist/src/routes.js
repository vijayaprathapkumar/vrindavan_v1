"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authLogin_1 = __importDefault(require("./routes/authLogin/authLogin"));
const categoryRoutes_1 = __importDefault(require("./routes/inventory/categoryRoutes"));
const subcategoryRoutes_1 = __importDefault(require("./routes/inventory/subcategoryRoutes"));
const productRoutes_1 = __importDefault(require("./routes/inventory/productRoutes"));
const productTypeRoutes_1 = __importDefault(require("./routes/inventory/productTypeRoutes"));
const productBrandRoutes_1 = __importDefault(require("./routes/inventory/productBrandRoutes"));
const customerRoutes_1 = __importDefault(require("./routes/customer/customerRoutes"));
const truckRoutes_1 = __importDefault(require("./routes/localities/truckRoutes"));
const hubsRoutes_1 = __importDefault(require("./routes/localities/hubsRoutes"));
const router = express_1.default.Router();
// Auth Login
router.use("/auth", authLogin_1.default);
// Inventory Routes
router.use("/categories", categoryRoutes_1.default);
router.use("/subcategories", subcategoryRoutes_1.default);
router.use("/products", productRoutes_1.default);
router.use("/product_brands", productBrandRoutes_1.default);
router.use("/product_types", productTypeRoutes_1.default);
// Customers
router.use("/customers", customerRoutes_1.default);
// Localities
router.use("/truck_routes", truckRoutes_1.default);
router.use("/hubs", hubsRoutes_1.default);
exports.default = router;
