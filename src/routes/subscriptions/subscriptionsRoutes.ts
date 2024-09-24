import express from "express";
import {
  fetchSubscriptions,
  addNewSubscription,
  updateExistingSubscription,
  removeSubscription,
  fetchSubscriptionById,
} from "../../controllers/subscriptions/subscriptionsControllers";

const router = express.Router();

router.get("/:userId", fetchSubscriptions); 
router.get("/subscription/:id", fetchSubscriptionById); 
router.post("/", addNewSubscription);
router.put("/:id", updateExistingSubscription); 
router.delete("/:id", removeSubscription); 

export default router;
