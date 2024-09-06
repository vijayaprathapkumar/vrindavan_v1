import { Request, Response } from 'express';
import { getAllProductTypes, createProductType } from '../models/productTypeModel';
import { createResponse } from '../utils/responseHandler';

export const getProductTypes = async (req: Request, res: Response): Promise<void> => {
    try {
        const productTypes = await getAllProductTypes();
        res.status(200).json(createResponse(200, 'Product types fetched successfully', productTypes));
    } catch (error) {
        res.status(500).json(createResponse(500, 'Error fetching product types', error));
    }
};

export const addProductType = async (req: Request, res: Response): Promise<void> => {
    const { name, weightage } = req.body;
    try {
        await createProductType(name, weightage);
        res.status(201).json(createResponse(201, 'Product type created successfully'));
    } catch (error) {
        res.status(500).json(createResponse(500, 'Error creating product type', error));
    }
};
