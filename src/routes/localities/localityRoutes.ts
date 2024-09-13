// routes/locality/localityRoutes.ts

import express from 'express';
import {
  getLocalities,
  addLocality,
  getLocality,
  updateLocality,
  deleteLocality
} from '../../controllers/localities/localityController';
import {
  localityValidation,
  localityIdValidation,
  validate
} from '../../validation/localities/localityValidation';

const router = express.Router();

// Fetch all localities
router.get("/", getLocalities);

// Add a new locality
router.post("/", localityValidation, validate, addLocality);

// Fetch locality by ID
router.get("/:id", localityIdValidation, validate, getLocality);

// Update locality by ID
router.put("/:id", localityIdValidation, localityValidation, validate, updateLocality);

// Delete locality by ID
router.delete("/:id", localityIdValidation, validate, deleteLocality);

export default router;
