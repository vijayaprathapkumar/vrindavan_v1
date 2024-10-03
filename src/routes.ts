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
import bannerRoutes from "./routes/banner/bannerRoutes"
import dealOfTheDayRoutes from "./routes/dealOfTheDay/dealOfTheDayRoutes";
import addToCartsRoutes from "./routes/addToCard/addToCartsRoutes";
import walletTransactionRoutes from "./routes/wallet/walletTransationsRoutes"
import subscriptionsRoutes from "./routes/subscriptions/subscriptionsRoutes";
import paymentsRoutes from "./routes/payments/paymentsRoutes";
import ordersRoutes from "./routes/orders-v1/ordersRoutes";

const router = express.Router();

// Auth Login
router.use("/auth", authLoginRoutes);

// Inventory Routes
router.use("/categories", categoryRoutes);
router.use("/subcategories", subcategoryRoutes);
router.use("/foods", foodRoutes);
router.use("/product_brands", productBrandRoutes);
router.use("/product_types", productTypeRoutes);

// Customers
router.use("/customers", customerRoutes);

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

// orders
router.use("/orderss", orderRoutes); //dummy
router.use("/route_orders", routeOrdersRoutes);
router.use("/hub_orders", hubOrdersRoutes);
router.use("/delivery_orders", devliveryBoyOrders);


//Banners

router.use("/banners", bannerRoutes);

//deal of the day

router.use("/deals", dealOfTheDayRoutes);

//AddToCarts
router.use("/cart",addToCartsRoutes );

//walletTransations
router.use("/wallet", walletTransactionRoutes);

//subscriptions
router.use("/subscriptions", subscriptionsRoutes);

//payments
router.use('/payments', paymentsRoutes);

//order-v1
router.use("/orders", ordersRoutes);
export default router;
