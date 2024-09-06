import { Request, Response } from 'express';
import { getAllCategories, createCategory, getCategoryById } from '../models/categoryModel';
import { createResponse } from '../utils/responseHandler';

export const getCategories = async (req: Request, res: Response): Promise<void> => {
    try {
        const categories = await getAllCategories();
        res.status(200).json(createResponse(200, 'Categories fetched successfully', categories));
    } catch (error) {
        res.status(500).json(createResponse(500, 'Error fetching categories', error));
    }
};

export const addCategory = async (req: Request, res: Response): Promise<void> => {
    const { name, description, weightage, image } = req.body;
    try {
        await createCategory(name, description, weightage, image);
        res.status(201).json(createResponse(201, 'Category created successfully'));
    } catch (error) {
        res.status(500).json(createResponse(500, 'Error creating category', error));
    }
};

export const getCategory = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    try {
        const category = await getCategoryById(parseInt(id));
        if (category.length === 0) {
            res.status(404).json(createResponse(404, 'Category not found'));
        } else {
            res.status(200).json(createResponse(200, 'Category fetched successfully', category));
        }
    } catch (error) {
        res.status(500).json(createResponse(500, 'Error fetching category', error));
    }
};
