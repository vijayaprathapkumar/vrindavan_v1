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

const router = express.Router();

router.get('/', getHubs);
router.post('/', hubValidation, validate, addHub);
router.get('/:id', hubIdValidation, validate, getHub);
router.put('/:id', hubIdValidation, hubValidation, validate, updateHub);
router.delete('/:id', hubIdValidation, validate, deleteHub);

export default router;
