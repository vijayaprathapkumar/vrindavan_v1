import { everyDayPaymentProcessJob } from "./models/payments/paymentsModels";
import { pauseSubscriptionsJobs, subcribtionsJob } from "./models/subscriptions/subcriptionCron";

export const initializeCronJobs = () => {
    subcribtionsJob();
    everyDayPaymentProcessJob();
    pauseSubscriptionsJobs();
  };