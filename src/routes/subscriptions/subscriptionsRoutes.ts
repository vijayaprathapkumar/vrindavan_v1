import { Router } from 'express';
import {
  addSubscription,
  getSubscriptions,
  deleteSubscription,
  pauseSubscription,
  resumeSubscription,
  updateSubscription,
  cancelSubscription,
  getSubscriptionById,
} from '../../controllers/subscriptions/subscriptionsControllers';

const router = Router();

// Define the routes for subscriptions
router.post('/', addSubscription);
router.get('/:userId', getSubscriptions);
router.get('/subById/:id', getSubscriptionById);
router.put('/:id', updateSubscription);
router.delete('/:id', deleteSubscription);
router.put('/pause/:id', pauseSubscription);
router.put('/resume/:id', resumeSubscription);
router.put('/cancel/:id', cancelSubscription);

export default router;
