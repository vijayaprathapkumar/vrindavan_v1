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
import { verifyDeviceToken } from '../../middlewares/authMiddleware';

const router = Router();

router.post('/',verifyDeviceToken, addSubscription);
router.get('/:userId',verifyDeviceToken, getSubscriptions);
router.get('/subById/:id',verifyDeviceToken, getSubscriptionById);
router.put('/:id',verifyDeviceToken, updateSubscription);
router.delete('/:id',verifyDeviceToken, deleteSubscription);
router.put('/pause/:id', verifyDeviceToken,pauseSubscription);
router.put('/resume/:id',verifyDeviceToken, resumeSubscription);
router.put('/cancel/:id',verifyDeviceToken, cancelSubscription);
router.put('/pause-info/:id',verifyDeviceToken, updateSubscriptionPauseController);


export default router;
