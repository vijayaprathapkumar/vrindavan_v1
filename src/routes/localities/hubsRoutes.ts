import express from 'express';
import {
    getHubs,
    addHub,
    getHub,
    updateHub,
    deleteHub
} from '../../controllers/localities/hubsController';
import {
    hubValidation,
    hubIdValidation,
    validate
} from '../../validation/localities/hubValidation';
import { verifyDeviceToken } from '../../middlewares/authMiddleware';

const router = express.Router();

router.get('/',verifyDeviceToken, getHubs);
router.post('/',verifyDeviceToken, hubValidation, validate, addHub);
router.get('/:id',verifyDeviceToken, hubIdValidation, validate, getHub);
router.put('/:id',verifyDeviceToken, hubIdValidation, hubValidation, validate, updateHub);
router.delete('/:id',verifyDeviceToken, hubIdValidation, validate, deleteHub);

export default router;
