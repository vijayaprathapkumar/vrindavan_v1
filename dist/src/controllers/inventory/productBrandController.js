"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeBrand = exports.UpdateBrand = exports.fetchBrandById = exports.addBrand = exports.fetchAllBrands = void 0;
const productBrandModel_1 = require("../../models/inventory/productBrandModel");
const responseHandler_1 = require("../../utils/responseHandler");
// Fetch all product brands
const fetchAllBrands = async (req, res) => {
    try {
        const { searchTerm } = req.query;
        const limit = parseInt(req.query.limit) || 10;
        const page = parseInt(req.query.page) || 1;
        const offset = (page - 1) * limit;
        const brands = await (0, productBrandModel_1.getAllBrands)(searchTerm, limit, offset);
        const totalCount = await (0, productBrandModel_1.getBrandsCount)(searchTerm);
        if (!brands || brands.length === 0 || totalCount === 0) {
            return res.status(404).json((0, responseHandler_1.createResponse)(404, "No product brands found"));
        }
        const brandsResponse = brands.map((brand) => ({
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
    }
    catch (error) {
        console.error("Error fetching product brands:", error);
        return res
            .status(500)
            .json((0, responseHandler_1.createResponse)(500, "Error fetching product brands", error.message));
    }
};
exports.fetchAllBrands = fetchAllBrands;
// Add a new product brand (POST)
const addBrand = async (req, res) => {
    try {
        const { name, active = true } = req.body;
        await (0, productBrandModel_1.createBrand)(name, active);
        return res.status(201).json({
            statusCode: 201,
            message: "Product brand created successfully",
            data: null,
        });
    }
    catch (error) {
        console.error("Error creating product brand:", error);
        return res
            .status(500)
            .json((0, responseHandler_1.createResponse)(500, "Error creating product brand", error.message));
    }
};
exports.addBrand = addBrand;
// Get product brand by ID
const fetchBrandById = async (req, res) => {
    const brandId = parseInt(req.params.id);
    if (isNaN(brandId)) {
        return res.status(400).json((0, responseHandler_1.createResponse)(400, "Invalid product brand ID"));
    }
    try {
        const [brand] = await (0, productBrandModel_1.getBrandById)(brandId);
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
        }
        else {
            return res.status(404).json((0, responseHandler_1.createResponse)(404, "Product brand not found"));
        }
    }
    catch (error) {
        console.error("Error fetching product brand:", error);
        return res
            .status(500)
            .json((0, responseHandler_1.createResponse)(500, "Error fetching product brand", error.message));
    }
};
exports.fetchBrandById = fetchBrandById;
// Update product brand by ID (PUT)
const UpdateBrand = async (req, res) => {
    const brandId = parseInt(req.params.id);
    if (isNaN(brandId)) {
        return res.status(400).json((0, responseHandler_1.createResponse)(400, "Invalid product brand ID"));
    }
    try {
        const { name, active } = req.body;
        const updatedBrand = await (0, productBrandModel_1.updateBrandById)(brandId, name, active);
        if (updatedBrand.affectedRows > 0) {
            return res.status(200).json({
                statusCode: 200,
                message: "Product brand updated successfully",
                data: {
                    brand_id: brandId,
                },
            });
        }
        else {
            return res.status(404).json((0, responseHandler_1.createResponse)(404, "Product brand not found"));
        }
    }
    catch (error) {
        console.error("Error updating product brand:", error);
        return res
            .status(500)
            .json((0, responseHandler_1.createResponse)(500, "Error updating product brand", error.message));
    }
};
exports.UpdateBrand = UpdateBrand;
// Delete product brand by ID (DELETE)
const removeBrand = async (req, res) => {
    const brandId = parseInt(req.params.id);
    if (isNaN(brandId)) {
        return res.status(400).json((0, responseHandler_1.createResponse)(400, "Invalid product brand ID"));
    }
    try {
        const deleted = await (0, productBrandModel_1.deleteBrandById)(brandId);
        if (deleted.affectedRows > 0) {
            return res.status(200).json({
                statusCode: 200,
                message: "Product brand deleted successfully",
                data: {
                    brand_id: brandId,
                },
            });
        }
        else {
            return res.status(404).json((0, responseHandler_1.createResponse)(404, "Product brand not found"));
        }
    }
    catch (error) {
        console.error("Error deleting product brand:", error);
        return res
            .status(500)
            .json((0, responseHandler_1.createResponse)(500, "Error deleting product brand", error.message));
    }
};
exports.removeBrand = removeBrand;
