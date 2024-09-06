import { Request, Response } from 'express';
import { getAllSubcategories, createSubcategory, getSubcategoryById } from '../models/subcategoryModel';
import { createResponse } from '../utils/responseHandler';

export const getSubcategories = async (req: Request, res: Response): Promise<void> => {
    try {
        const subcategories = await getAllSubcategories();
        res.status(200).json(createResponse(200, 'Subcategories fetched successfully', subcategories));
    } catch (error) {
        res.status(500).json(createResponse(500, 'Error fetching subcategories', error));
    }
};

export const addSubcategory = async (req: Request, res: Response): Promise<void> => {
    const { name, categoryID, description, weightage, image } = req.body;
    try {
        await createSubcategory(name, categoryID, description, weightage, image);
        res.status(201).json(createResponse(201, 'Subcategory created successfully'));
    } catch (error) {
        res.status(500).json(createResponse(500, 'Error creating subcategory', error));
    }
};

export const getSubcategory = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    try {
        const subcategory = await getSubcategoryById(parseInt(id));
        if (subcategory.length === 0) {
            res.status(404).json(createResponse(404, 'Subcategory not found'));
        } else {
            res.status(200).json(createResponse(200, 'Subcategory fetched successfully', subcategory));
        }
    } catch (error) {
        res.status(500).json(createResponse(500, 'Error fetching subcategory', error));
    }
};
