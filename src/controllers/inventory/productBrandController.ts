import { Request, Response } from "express";
import {
  getAllBrands,
  createBrand,
  getBrandById,
  updateBrandById,
  deleteBrandById,
  getBrandsCount,
} from "../../models/inventory/productBrandModel";
import { createResponse } from "../../utils/responseHandler";

// Fetch all product brands
export const fetchAllBrands = async (
  req: Request,
  res: Response
): Promise<Response<any, Record<string, any>> | void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const page = parseInt(req.query.page as string) || 1;
    const sortField = (req.query.sortField as string) || "";
    const sortOrder = (req.query.sortOrder as string) || "ASC";
    const searchTerm = req.query.searchTerm
      ? (req.query.searchTerm as string)
      : null;

    const offset = (page - 1) * limit;

    const brands = await getAllBrands(
      searchTerm as string,
      limit,
      offset,
      sortField,
      sortOrder
    );
    const totalCount = await getBrandsCount(searchTerm as string);

    if (!brands || brands.length === 0 || totalCount === 0) {
      return res
        .status(404)
        .json(createResponse(404, "No product brands found"));
    }

    const brandsResponse = brands.map((brand: any) => ({
      brand_id: brand.id,
      brand_name: brand.name,
      active: brand.active,
      created_at: brand.created_at,
      updated_at: brand.updated_at,
    }));

    return res.status(200).json({
      statusCode: 200,
      message: "Product brands fetched successfully",
      data: {
        brands: brandsResponse,
        totalCount,
        limit,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page,
      },
    });
  } catch (error) {
    console.error("Error fetching product brands:", error);
    return res
      .status(500)
      .json(
        createResponse(500, "Error fetching product brands", error.message)
      );
  }
};

// Add a new product brand (POST)
export const addBrand = async (
  req: Request,
  res: Response
): Promise<Response<any, Record<string, any>> | void> => {
  try {
    const { name, active = true } = req.body;
    await createBrand(name, active);

    return res.status(201).json({
      statusCode: 201,
      message: "Product brand created successfully",
      data: null,
    });
  } catch (error) {
    console.error("Error creating product brand:", error);
    return res
      .status(500)
      .json(createResponse(500, "Error creating product brand", error.message));
  }
};

// Get product brand by ID
export const fetchBrandById = async (
  req: Request,
  res: Response
): Promise<Response<any, Record<string, any>> | void> => {
  const brandId = parseInt(req.params.id);
  if (isNaN(brandId)) {
    return res
      .status(400)
      .json(createResponse(400, "Invalid product brand ID"));
  }

  try {
    const [brand] = await getBrandById(brandId);
    if (brand) {
      const brandResponse = {
        brand_id: brand.id,
        brand_name: brand.name,
        active: brand.active,
        created_at: brand.created_at,
        updated_at: brand.updated_at,
      };

      return res.status(200).json({
        statusCode: 200,
        message: "Product brand fetched successfully",
        data: { brands: [brandResponse] },
      });
    } else {
      return res
        .status(404)
        .json(createResponse(404, "Product brand not found"));
    }
  } catch (error) {
    console.error("Error fetching product brand:", error);
    return res
      .status(500)
      .json(createResponse(500, "Error fetching product brand", error.message));
  }
};

// Update product brand by ID (PUT)
export const UpdateBrand = async (
  req: Request,
  res: Response
): Promise<Response<any, Record<string, any>> | void> => {
  const brandId = parseInt(req.params.id);
  if (isNaN(brandId)) {
    return res
      .status(400)
      .json(createResponse(400, "Invalid product brand ID"));
  }

  try {
    const { name, active } = req.body;
    const updatedBrand = await updateBrandById(brandId, name, active);

    if (updatedBrand.affectedRows > 0) {
      return res.status(200).json({
        statusCode: 200,
        message: "Product brand updated successfully",
        data: {
          brand_id: brandId,
        },
      });
    } else {
      return res
        .status(404)
        .json(createResponse(404, "Product brand not found"));
    }
  } catch (error) {
    console.error("Error updating product brand:", error);
    return res
      .status(500)
      .json(createResponse(500, "Error updating product brand", error.message));
  }
};

// Delete product brand by ID (DELETE)
export const removeBrand = async (
  req: Request,
  res: Response
): Promise<Response<any, Record<string, any>> | void> => {
  const brandId = parseInt(req.params.id);
  if (isNaN(brandId)) {
    return res
      .status(400)
      .json(createResponse(400, "Invalid product brand ID"));
  }

  try {
    const deleted = await deleteBrandById(brandId);

    if (deleted.affectedRows > 0) {
      return res.status(200).json({
        statusCode: 200,
        message: "Product brand deleted successfully",
        data: {
          brand_id: brandId,
        },
      });
    } else {
      return res
        .status(404)
        .json(createResponse(404, "Product brand not found"));
    }
  } catch (error) {
    console.error("Error deleting product brand:", error);
    return res
      .status(500)
      .json(createResponse(500, "Error deleting product brand", error.message));
  }
};
