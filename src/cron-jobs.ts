import { everyDayPaymentProcessJob } from "./models/payments/paymentsModels";
import { pauseSubscriptionsJobs, subscriptionsJob } from "./models/subscriptions/subcriptionCron";

export const initializeCronJobs = () => {
    subscriptionsJob();
    everyDayPaymentProcessJob();
    pauseSubscriptionsJobs();
  };