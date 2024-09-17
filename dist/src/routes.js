"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authLogin_1 = __importDefault(require("./routes/authLogin/authLogin"));
const categoryRoutes_1 = __importDefault(require("./routes/inventory/categoryRoutes"));
const subcategoryRoutes_1 = __importDefault(require("./routes/inventory/subcategoryRoutes"));
const foodRoutes_1 = __importDefault(require("./routes/inventory/foodRoutes"));
const productTypeRoutes_1 = __importDefault(require("./routes/inventory/productTypeRoutes"));
const productBrandRoutes_1 = __importDefault(require("./routes/inventory/productBrandRoutes"));
const customerRoutes_1 = __importDefault(require("./routes/customer/customerRoutes"));
const truckRoutes_1 = __importDefault(require("./routes/localities/truckRoutes"));
const hubsRoutes_1 = __importDefault(require("./routes/localities/hubsRoutes"));
const localityRouter_1 = __importDefault(require("./routes/localities/localityRouter"));
const faqCategoryRoutes_1 = __importDefault(require("./routes/faqs/faqCategoryRoutes"));
const faqsRoutes_1 = __importDefault(require("./routes/faqs/faqsRoutes"));
const deliveryBoyRoutes_1 = __importDefault(require("./routes/deliveryBoy/deliveryBoyRoutes"));
const commissionRoutes_1 = __importDefault(require("./routes/deliveryBoy/commissionRoutes"));
const orderRoutes_1 = __importDefault(require("./routes/orders/orderRoutes"));
const routeOrdersRoutes_1 = __importDefault(require("./routes/orders/routeOrdersRoutes"));
const router = express_1.default.Router();
// Auth Login
router.use("/auth", authLogin_1.default);
// Inventory Routes
router.use("/categories", categoryRoutes_1.default);
router.use("/subcategories", subcategoryRoutes_1.default);
router.use("/foods", foodRoutes_1.default);
router.use("/product_brands", productBrandRoutes_1.default);
router.use("/product_types", productTypeRoutes_1.default);
// Customers
router.use("/customers", customerRoutes_1.default);
// Localities
router.use("/truck_routes", truckRoutes_1.default);
router.use("/hubs", hubsRoutes_1.default);
router.use('/localities', localityRouter_1.default);
// faqs
router.use("/faqs_categories", faqCategoryRoutes_1.default);
router.use("/faqs", faqsRoutes_1.default);
// deliveryBoys
router.use("/delivery_boys", deliveryBoyRoutes_1.default);
router.use("/commissions", commissionRoutes_1.default);
// orders
router.use("/orders", orderRoutes_1.default);
router.use('/route_orders', routeOrdersRoutes_1.default);
exports.default = router;
