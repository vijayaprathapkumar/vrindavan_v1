import { Router } from "express";
import { verifyDeviceToken } from "../../middlewares/authMiddleware";
import { fetchSimilarProducts } from "../../controllers/similarProducts/similarProductController";

const router = Router();

router.get("/:foodId", verifyDeviceToken, fetchSimilarProducts);

export default router;
