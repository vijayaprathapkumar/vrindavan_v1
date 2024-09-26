"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const subscriptionsControllers_1 = require("../../controllers/subscriptions/subscriptionsControllers");
const router = express_1.default.Router();
router.get("/:userId", subscriptionsControllers_1.fetchSubscriptions);
router.get("/subscription/:id", subscriptionsControllers_1.fetchSubscriptionById);
router.post("/", subscriptionsControllers_1.addNewSubscription);
router.put("/:id", subscriptionsControllers_1.updateExistingSubscription);
router.delete("/:id", subscriptionsControllers_1.removeSubscription);
exports.default = router;
