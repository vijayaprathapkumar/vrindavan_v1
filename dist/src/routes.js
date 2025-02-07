"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authLoginRoute_1 = __importDefault(require("./routes/authLogin/authLoginRoute"));
const categoryRoutes_1 = __importDefault(require("./routes/inventory/categoryRoutes"));
const subcategoryRoutes_1 = __importDefault(require("./routes/inventory/subcategoryRoutes"));
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
const hubOrdersRoutes_1 = __importDefault(require("./routes/orders/hubOrdersRoutes"));
const devliveryBoyOrders_1 = __importDefault(require("./routes/orders/devliveryBoyOrders"));
const foodRoutes_1 = __importDefault(require("./routes/inventory/foodRoutes"));
const bannerRoutes_1 = __importDefault(require("./routes/banner/bannerRoutes"));
const dealOfTheDayRoutes_1 = __importDefault(require("./routes/dealOfTheDay/dealOfTheDayRoutes"));
const addToCartsRoutes_1 = __importDefault(require("./routes/addToCard/addToCartsRoutes"));
const walletTransationsRoutes_1 = __importDefault(require("./routes/wallet/walletTransationsRoutes"));
const subscriptionsRoutes_1 = __importDefault(require("./routes/subscriptions/subscriptionsRoutes"));
const placeOrderRoutes_1 = __importDefault(require("./routes/placeOrder/placeOrderRoutes"));
const notificationRoutes_1 = __importDefault(require("./routes/notification/notificationRoutes"));
const featureProductRoutes_1 = __importDefault(require("./routes/featureProduct/featureProductRoutes"));
const similarProductRoute_1 = __importDefault(require("./routes/similarProducts/similarProductRoute"));
const loginRoutes_1 = __importDefault(require("./routes/adminLogin/loginRoutes"));
const deliveryAddressesRoutes_1 = __importDefault(require("./routes/customer/deliveryAddressesRoutes"));
const customerPrioritiesRoutes_1 = __importDefault(require("./routes/customer/customerPrioritiesRoutes"));
const specialCommissionRoutes_1 = __importDefault(require("./routes/deliveryBoy/specialCommissionRoutes"));
const imageUploadRoutes_1 = __importDefault(require("./routes/imageUpload/imageUploadRoutes"));
const commissionPayoutRoutes_1 = __importDefault(require("./routes/deliveryBoy/commissionPayoutRoutes"));
const cronLogsRoutes_1 = __importDefault(require("./routes/cronLogsRoutes/cronLogsRoutes"));
const discontinuedCustomersRoutes_1 = __importDefault(require("./routes/discontinuedCustomersRoutes/discontinuedCustomersRoutes"));
const router = express_1.default.Router();
// Auth Login
router.use("/auth", authLoginRoute_1.default);
// Inventory Routes
router.use("/categories", categoryRoutes_1.default);
router.use("/subcategories", subcategoryRoutes_1.default);
router.use("/foods", foodRoutes_1.default);
router.use("/product_brands", productBrandRoutes_1.default);
router.use("/product_types", productTypeRoutes_1.default);
// Customers
router.use("/customers", customerRoutes_1.default);
router.use("/deliveryAddresses", deliveryAddressesRoutes_1.default);
// Localities
router.use("/truck_routes", truckRoutes_1.default);
router.use("/hubs", hubsRoutes_1.default);
router.use("/localities", localityRouter_1.default);
// faqs
router.use("/faqs_categories", faqCategoryRoutes_1.default);
router.use("/faqs", faqsRoutes_1.default);
// deliveryBoys
router.use("/delivery_boys", deliveryBoyRoutes_1.default);
router.use("/commissions", commissionRoutes_1.default);
router.use("/special-commissions", specialCommissionRoutes_1.default);
router.use("/commission-payouts", commissionPayoutRoutes_1.default);
// orders
router.use("/orders", orderRoutes_1.default);
router.use("/route_orders", routeOrdersRoutes_1.default);
router.use("/hub_orders", hubOrdersRoutes_1.default);
router.use("/delivery_orders", devliveryBoyOrders_1.default);
//Banners
router.use("/banners", bannerRoutes_1.default);
//deal of the day
router.use("/deals", dealOfTheDayRoutes_1.default);
//AddToCarts
router.use("/cart", addToCartsRoutes_1.default);
//walletTransations
router.use("/wallet", walletTransationsRoutes_1.default);
//subscriptions
router.use("/subscriptions", subscriptionsRoutes_1.default);
//placeOrder
router.use("/placeOrder", placeOrderRoutes_1.default);
//notifications
router.use("/notifications", notificationRoutes_1.default);
// feature_products
router.use("/feature_products", featureProductRoutes_1.default);
//similarProduct
router.use("/similarProduct", similarProductRoute_1.default);
// admin Login
router.use("/admin", loginRoutes_1.default);
// customer-priorities
router.use("/customer-priorities", customerPrioritiesRoutes_1.default);
//image upload
router.use("/imageUpload", imageUploadRoutes_1.default);
//cron logs
router.use("/cron-logs", cronLogsRoutes_1.default);
//discontinued Customers Routes
router.use("/discontinued", discontinuedCustomersRoutes_1.default);
exports.default = router;
