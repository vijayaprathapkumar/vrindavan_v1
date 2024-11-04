import { Request, Response } from 'express';
import { getFeaturedCategories, getCountOfFeaturedCategories } from "../../models/featureProduct/featureProductModel";
import { createResponse } from "../../utils/responseHandler";

export const fetchFeaturedCategories = async (req: Request, res: Response): Promise<Response> => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;
    const searchTerm = req.query.searchTerm as string;


    try {
        const featuredCategories = await getFeaturedCategories(limit, offset,searchTerm);
        
        const { categoryCount, totalFoodCount } = await getCountOfFeaturedCategories();

        return res.status(200).json(
            createResponse(200, "Featured categories fetched successfully.", {
                featuredCategories,
                currentPage: page,
                limit,
                totalPages: Math.ceil(categoryCount / limit),
                totalItems: categoryCount,
            })
        );
    } catch (error) {
        console.error("Error fetching featured categories:", error);
        return res.status(500).json(createResponse(500, "Failed to fetch featured categories."));
    }
};
