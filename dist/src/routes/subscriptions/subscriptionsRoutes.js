"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const subscriptionsControllers_1 = require("../../controllers/subscriptions/subscriptionsControllers");
const router = (0, express_1.Router)();
// Define the routes for subscriptions
router.post('/', subscriptionsControllers_1.addSubscription);
router.get('/:userId', subscriptionsControllers_1.getSubscriptions);
router.get('/subById/:id', subscriptionsControllers_1.getSubscriptionById);
router.put('/:id', subscriptionsControllers_1.updateSubscription);
router.delete('/:id', subscriptionsControllers_1.deleteSubscription);
router.put('/pause/:id', subscriptionsControllers_1.pauseSubscription);
router.put('/resume/:id', subscriptionsControllers_1.resumeSubscription);
router.put('/cancel/:id', subscriptionsControllers_1.cancelSubscription);
exports.default = router;
