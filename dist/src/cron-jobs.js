"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeCronJobs = void 0;
const paymentsModels_1 = require("./models/payments/paymentsModels");
const subcriptionCron_1 = require("./models/subscriptions/subcriptionCron");
const initializeCronJobs = () => {
    (0, subcriptionCron_1.subcribtionsJob)();
    (0, paymentsModels_1.everyDayPaymentProcessJob)();
    (0, subcriptionCron_1.pauseSubscriptionsJobs)();
};
exports.initializeCronJobs = initializeCronJobs;
