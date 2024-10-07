import express from 'express';
import {
  getLocalities,
  addLocality,
  getLocality,
  updateLocality,
  deleteLocality,
} from '../../controllers/localities/localityController';
import {
  localityValidation,
  localityIdValidation,
  validate,
} from '../../validation/localities/localityValidation';
import { verifyDeviceToken } from '../../middlewares/authMiddleware';

const router = express.Router();

router.get('/',verifyDeviceToken, getLocalities);
router.post('/',verifyDeviceToken, localityValidation, validate, addLocality);
router.get('/:id',verifyDeviceToken, localityIdValidation, validate, getLocality);
router.put('/:id', verifyDeviceToken,localityIdValidation, localityValidation, validate, updateLocality);
router.delete('/:id',verifyDeviceToken, localityIdValidation, validate, deleteLocality);

export default router;
