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

const router = express.Router();

router.get('/', getLocalities);
router.post('/', localityValidation, validate, addLocality);
router.get('/:id', localityIdValidation, validate, getLocality);
router.put('/:id', localityIdValidation, localityValidation, validate, updateLocality);
router.delete('/:id', localityIdValidation, validate, deleteLocality);

export default router;
