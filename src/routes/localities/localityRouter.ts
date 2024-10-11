import express from 'express';
import {
  getLocalities,
  addLocality,
  getLocality,
  updateLocality,
  deleteLocality,
} from '../../controllers/localities/localityController';

import { verifyDeviceToken } from '../../middlewares/authMiddleware';

const router = express.Router();

router.get('/',verifyDeviceToken, getLocalities);
router.post('/',verifyDeviceToken, addLocality);
router.get('/:id',verifyDeviceToken, getLocality);
router.put('/:id', verifyDeviceToken, updateLocality);
router.delete('/:id',verifyDeviceToken, deleteLocality);

export default router;
