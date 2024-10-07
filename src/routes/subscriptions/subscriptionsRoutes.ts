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
  updateSubscriptionPauseController,
} from '../../controllers/subscriptions/subscriptionsControllers';

const router = Router();

router.post('/', addSubscription);
router.get('/:userId', getSubscriptions);
router.get('/subById/:id', getSubscriptionById);
router.put('/:id', updateSubscription);
router.delete('/:id', deleteSubscription);
router.put('/pause/:id', pauseSubscription);
router.put('/resume/:id', resumeSubscription);
router.put('/cancel/:id', cancelSubscription);
router.put('/pause-info/:id', updateSubscriptionPauseController);


export default router;
