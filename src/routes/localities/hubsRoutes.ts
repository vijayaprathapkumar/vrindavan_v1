import express from 'express';
import {
    getHubs,
    addHub,
    getHub,
    updateHub,
    deleteHub
} from '../../controllers/localities/hubsController';
import { verifyDeviceToken } from '../../middlewares/authMiddleware';

const router = express.Router();

router.get('/', verifyDeviceToken, getHubs);
router.post('/', verifyDeviceToken, addHub);
router.get('/:id', verifyDeviceToken, getHub);
router.put('/:id', verifyDeviceToken, updateHub);
router.delete('/:id', verifyDeviceToken, deleteHub);

export default router;
