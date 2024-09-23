import { Request, Response } from "express";
import {
  getAllBrands,
  createBrand,
  getBrandById,
  updateBrandById,
  deleteBrandById,
  getBrandsCount
} from "../../models/inventory/productBrandModel";
import { createResponse } from "../../utils/responseHandler";

// Fetch all product brands
export const getProductBrands = async (req: Request, res: Response): Promise<void> => {
  const { searchTerm, limit = 10, page = 1 } = req.query;
  const parsedLimit = Number(limit);
  const parsedPage = Number(page);
  const offset = (parsedPage - 1) * parsedLimit;

  try {
    const brands = await getAllBrands(searchTerm as string, parsedLimit, offset);
    const totalCount = await getBrandsCount(searchTerm as string);

    res.status(200).json(createResponse(200, "Product brands fetched successfully", {
      brands,
      pagination: {
        total: totalCount,
        limit: parsedLimit,
        page: parsedPage,
        totalPages: Math.ceil(totalCount / parsedLimit),
      }
    }));
  } catch (error) {
    res.status(500).json(createResponse(500, "Error fetching product brands", error));
  }
};


// Add a new product brand (POST)
export const addProductBrand = async (req: Request, res: Response): Promise<void> => {
  const { name, active = true } = req.body;
  try {
    await createBrand(name, active);
    res.status(201).json(createResponse(201, "Product brand created successfully"));
  } catch (error) {
    res.status(500).json(createResponse(500, "Error creating product brand", error));
  }
};

// Get product brand by ID
export const getProductBrandById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const brand = await getBrandById(parseInt(id));
    if (brand.length === 0) {
      res.status(404).json(createResponse(404, "Product brand not found"));
    } else {
      res.status(200).json(createResponse(200, "Product brand fetched successfully", brand));
    }
  } catch (error) {
    res.status(500).json(createResponse(500, "Error fetching product brand", error));
  }
};

// Update product brand by ID (PUT)
export const updateProductBrand = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { name, active } = req.body;
  try {
    await updateBrandById(parseInt(id), name, active);
    res.status(200).json(createResponse(200, "Product brand updated successfully"));
  } catch (error) {
    res.status(500).json(createResponse(500, "Error updating product brand", error));
  }
};

// Delete product brand by ID
export const deleteProductBrand = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    await deleteBrandById(parseInt(id));
    res.status(200).json(createResponse(200, "Product brand deleted successfully"));
  } catch (error) {
    res.status(500).json(createResponse(500, "Error deleting product brand", error));
  }
};
