import { Request, Response } from 'express';
import { getAllBrands, createBrand } from '../models/productBrandModel';
import { createResponse } from '../utils/responseHandler';

export const getProductBrands = async (req: Request, res: Response): Promise<void> => {
    try {
        const brands = await getAllBrands();
        res.status(200).json(createResponse(200, 'Product brands fetched successfully', brands));
    } catch (error) {
        res.status(500).json(createResponse(500, 'Error fetching product brands', error));
    }
};

export const addProductBrand = async (req: Request, res: Response): Promise<void> => {
    const { name } = req.body;
    try {
        await createBrand(name);
        res.status(201).json(createResponse(201, 'Product brand created successfully'));
    } catch (error) {
        res.status(500).json(createResponse(500, 'Error creating product brand', error));
    }
};
