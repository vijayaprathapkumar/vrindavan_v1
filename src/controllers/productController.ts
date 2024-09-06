import { Request, Response } from 'express';
import { getAllProducts, createProduct,getProductById as fetchProductById } from '../models/productModel';
import { createResponse } from '../utils/responseHandler';

export const getProducts = async (req: Request, res: Response): Promise<void> => {
    try {
        const products = await getAllProducts();
        res.status(200).json(createResponse(200, 'Products fetched successfully', products));
    } catch (error) {
        res.status(500).json(createResponse(500, 'Error fetching products', error));
    }
};

export const addProduct = async (req: Request, res: Response): Promise<void> => {
    const {
        name, price, discountPrice, description, productTypeID, brandID, categoryID, subcategoryID,
        locality, weightage, image, unitSize, skuCode, barcode, cgst, sgst, featured,
        subscription, trackInventory
    } = req.body;

    try {
        await createProduct(
            name, price, discountPrice, description, productTypeID, brandID, categoryID, subcategoryID,
            locality, weightage, image, unitSize, skuCode, barcode, cgst, sgst, featured,
            subscription, trackInventory
        );
        res.status(201).json(createResponse(201, 'Product created successfully'));
    } catch (error) {
        res.status(500).json(createResponse(500, 'Error creating product', error));
    }
};

export const getProductById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const product = await fetchProductById(Number(id));
    if (product.length === 0) {
      res.status(404).json(createResponse(404, "Product not found"));
      return;
    }
    res.json(createResponse(200, "Product fetched successfully", product[0]));
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json(createResponse(500, "Database error"));
  }
};