import express from "express";
import authLoginRoutes from "./routes/authLogin/authLoginRoute";
import categoryRoutes from "./routes/inventory/categoryRoutes";
import subcategoryRoutes from "./routes/inventory/subcategoryRoutes";
import productTypeRoutes from "./routes/inventory/productTypeRoutes";
import productBrandRoutes from "./routes/inventory/productBrandRoutes";
import customerRoutes from "./routes/customer/customerRoutes";
import truckRoutes from "./routes/localities/truckRoutes";
import hubsRoutes from "./routes/localities/hubsRoutes";
import localityRoutes from "./routes/localities/localityRouter";
import faqCategoryRoutes from "./routes/faqs/faqCategoryRoutes";
import faqsRoutes from "./routes/faqs/faqsRoutes";
import deliveryBoyRoutes from "./routes/deliveryBoy/deliveryBoyRoutes";
import commissionRoutes from "./routes/deliveryBoy/commissionRoutes";
import orderRoutes from "./routes/orders/orderRoutes";
import routeOrdersRoutes from "./routes/orders/routeOrdersRoutes";
import hubOrdersRoutes from "./routes/orders/hubOrdersRoutes";
import devliveryBoyOrders from "./routes/orders/devliveryBoyOrders";
import foodRoutes from "./routes/inventory/foodRoutes";
import bannerRoutes from "./routes/banner/bannerRoutes";
import dealOfTheDayRoutes from "./routes/dealOfTheDay/dealOfTheDayRoutes";
import addToCartsRoutes from "./routes/addToCard/addToCartsRoutes";
import walletTransactionRoutes from "./routes/wallet/walletTransationsRoutes";
import subscriptionsRoutes from "./routes/subscriptions/subscriptionsRoutes";
import placeOrderRoutes from "./routes/placeOrder/placeOrderRoutes";
import notificationRoutes from "./routes/notification/notificationRoutes";
import featureProductRoutes from "./routes/featureProduct/featureProductRoutes";
import similarProductsRoutes from "./routes/similarProducts/similarProductRoute";
import loginRoutes from "./routes/adminLogin/loginRoutes";
import deliveryAddressesRoutes from "./routes/customer/deliveryAddressesRoutes";
import customerPrioritiesRoutes from "./routes/customer/customerPrioritiesRoutes";
import specialCommissionRoutes from "./routes/deliveryBoy/specialCommissionRoutes";
import imageUploadRoutes from "./routes/imageUpload/imageUploadRoutes";
import commissionPayoutRoutes from "./routes/deliveryBoy/commissionPayoutRoutes";
import cronLogsRoutes from "./routes/cronLogsRoutes/cronLogsRoutes";
import discontinuedCustomersRoutes from "./routes/discontinuedCustomersRoutes/discontinuedCustomersRoutes";
import stockCountRoutes from "./routes/inventory/stockCountRoutes";
import orderStatusRoutes from "./routes/orderStatus/orderStatusRoutes";
import routeOrderRoutes from "./routes/orderAdmin/routeOrderRoutes";
import hubsOrderRoutes from "./routes/orderAdmin/hubsOrderRoutes";
import localityOrderRoutes from "./routes/orderAdmin/localityOrderRoutes";
import deliveryBoyOrdersRoutes from "./routes/orderAdmin/deliveryBoyOrdersRoutes";
import guestRoutes from "./routes/guest/guestRoute";
import webhooks from "./routes/webhooks/webhooks";
import { razorpayWebhookHandler } from "./models/razorpayWebhook/razorpayWebhook";

const router = express.Router();

// Auth Login
router.use("/auth", authLoginRoutes);

// Inventory Routes
router.use("/categories", categoryRoutes);
router.use("/subcategories", subcategoryRoutes);
router.use("/foods", foodRoutes);
router.use("/product_brands", productBrandRoutes);
router.use("/product_types", productTypeRoutes);
router.use("/stock_count", stockCountRoutes);
// Customers
router.use("/customers", customerRoutes);
router.use("/deliveryAddresses", deliveryAddressesRoutes);

// Localities
router.use("/truck_routes", truckRoutes);
router.use("/hubs", hubsRoutes);
router.use("/localities", localityRoutes);

// faqs
router.use("/faqs_categories", faqCategoryRoutes);
router.use("/faqs", faqsRoutes);

// deliveryBoys
router.use("/delivery_boys", deliveryBoyRoutes);
router.use("/commissions", commissionRoutes);
router.use("/special-commissions", specialCommissionRoutes);
router.use("/commission-payouts", commissionPayoutRoutes);

// orders
router.use("/orders", orderRoutes);
router.use("/route_orders", routeOrdersRoutes);
router.use("/hub_orders", hubOrdersRoutes);
router.use("/delivery_orders", devliveryBoyOrders);

//Banners
router.use("/banners", bannerRoutes);

//deal of the day

router.use("/deals", dealOfTheDayRoutes);

//AddToCarts
router.use("/cart", addToCartsRoutes);

//walletTransations
router.use("/wallet", walletTransactionRoutes);

//subscriptions
router.use("/subscriptions", subscriptionsRoutes);

//placeOrder
router.use("/placeOrder", placeOrderRoutes);

//notifications
router.use("/notifications", notificationRoutes);

// feature_products
router.use("/feature_products", featureProductRoutes);

//similarProduct
router.use("/similarProduct", similarProductsRoutes);

// admin Login
router.use("/admin", loginRoutes);

// customer-priorities
router.use("/customer-priorities", customerPrioritiesRoutes);

//image upload
router.use("/imageUpload", imageUploadRoutes);

//cron logs
router.use("/cron-logs", cronLogsRoutes);

//discontinued Customers Routes
router.use("/discontinued", discontinuedCustomersRoutes);

//order-service-status
router.use("/order-service-status", orderStatusRoutes);

// admin orders
router.use("/routeOrders", routeOrderRoutes);
router.use("/hubOrders", hubsOrderRoutes);
router.use("/localityOrders", localityOrderRoutes);
router.use("/deliveryOrder", deliveryBoyOrdersRoutes);

router.post("/razorpay/webhook", express.raw({ type: "application/json" }), razorpayWebhookHandler);

// Guest Token
router.use("/guestUser", guestRoutes);
export default router;
