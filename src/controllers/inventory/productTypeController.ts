import { Request, Response } from "express";
import {
  getAllProductTypes,
  createProductType,
  getProductTypeById as fetchProductTypeById,
  updateProductTypeById,
  deleteProductTypeById,
} from "../../models/inventory/productTypeModel";
import { createResponse } from "../../utils/responseHandler";

// Fetch all product types
export const getProductTypes = async (
  req: Request,
  res: Response
): Promise<Response<any, Record<string, any>> | void> => {
  const limit = parseInt(req.query.limit as string) || 10;
  const page = parseInt(req.query.page as string) || 1;
  const searchTerm = (req.query.searchTerm as string) || "";
  const sortField = (req.query.sortField as string) || "";
  const sortOrder = (req.query.sortOrder as string) || "";
  const offset = (page - 1) * limit;

  try {
    const { total, rows } = await getAllProductTypes(
      searchTerm,
      limit,
      offset,
      sortField,
      sortOrder
    );

    if (!rows || rows.length === 0 || total === 0) {
      return res
        .status(404)
        .json(createResponse(404, "No product types found"));
    }

    const totalPages = Math.ceil(total / limit);
    return res.status(200).json({
      statusCode: 200,
      message: "Product types fetched successfully",
      data: {
        productTypes: rows,
        totalCount: total,
        totalPages,
        currentPage: page,
        limit,
      },
    });
  } catch (error) {
    console.error("Error fetching product types:", error);
    return res
      .status(500)
      .json(createResponse(500, "Error fetching product types", error.message));
  }
};

// Add a new product type
export const addProductType = async (
  req: Request,
  res: Response
): Promise<Response<any, Record<string, any>> | void> => {
  const { name, weightage, active = true } = req.body;

  try {
    await createProductType(name, weightage, active);
    return res.status(201).json({
      statusCode: 201,
      message: "Product type created successfully",
      data: null,
    });
  } catch (error) {
    console.error("Error creating product type:", error);
    return res
      .status(500)
      .json(createResponse(500, "Error creating product type", error.message));
  }
};

// Get product type by ID
export const getProductTypeById = async (
  req: Request,
  res: Response
): Promise<Response<any, Record<string, any>> | void> => {
  const productTypeId = Number(req.params.id);

  if (isNaN(productTypeId)) {
    return res.status(400).json(createResponse(400, "Invalid product type ID"));
  }

  try {
    const productType = await fetchProductTypeById(productTypeId);

    if (!productType || productType.length === 0) {
      return res
        .status(404)
        .json(createResponse(404, "Product type not found"));
    }

    return res.status(200).json({
      statusCode: 200,
      message: "Product type fetched successfully",
      data: [productType[0]],
    });
  } catch (error) {
    console.error("Error fetching product type:", error);
    return res
      .status(500)
      .json(createResponse(500, "Error fetching product type", error.message));
  }
};
// Update product type by ID
export const updateProductType = async (
  req: Request,
  res: Response
): Promise<Response<any, Record<string, any>> | void> => {
  const productTypeId = Number(req.params.id);
  const { name, weightage, active } = req.body;

  if (isNaN(productTypeId)) {
    return res.status(400).json(createResponse(400, "Invalid product type ID"));
  }

  try {
    const result = await updateProductTypeById(
      productTypeId,
      name,
      weightage,
      active
    );

    if (result.affectedRows > 0) {
      return res.status(200).json({
        statusCode: 200,
        message: "Product type updated successfully",
        data: { productTypeId },
      });
    } else {
      return res
        .status(404)
        .json(createResponse(404, "Product type not found"));
    }
  } catch (error) {
    console.error("Error updating product type:", error);
    return res
      .status(500)
      .json(createResponse(500, "Error updating product type", error.message));
  }
};

// Delete product type by ID
export const deleteProductType = async (
  req: Request,
  res: Response
): Promise<Response<any, Record<string, any>> | void> => {
  const productTypeId = Number(req.params.id);

  if (isNaN(productTypeId)) {
    return res.status(400).json(createResponse(400, "Invalid product type ID"));
  }

  try {
    const result = await deleteProductTypeById(productTypeId);

    if (result.affectedRows > 0) {
      return res.status(200).json({
        statusCode: 200,
        message: "Product type deleted successfully",
        data: { productTypeId },
      });
    } else {
      return res
        .status(404)
        .json(createResponse(404, "Product type not found"));
    }
  } catch (error) {
    console.error("Error deleting product type:", error);
    return res
      .status(500)
      .json(createResponse(500, "Error deleting product type", error.message));
  }
};
