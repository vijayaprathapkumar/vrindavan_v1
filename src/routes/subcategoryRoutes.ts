import express from 'express';
import { getSubcategories, addSubcategory, getSubcategory } from '../controllers/subcategoryController';

const router = express.Router();

// Route to fetch all subcategories
router.get('/', getSubcategories);

// Route to add a new subcategory
router.post('/', addSubcategory);

// Route to get subcategory by ID
router.get('/:id', getSubcategory);

export default router;
