import { Router } from "express";
import { verifyDeviceToken } from "../../middlewares/authMiddleware";
import { fetchProductById, fetchSimilarProducts } from "../../controllers/similarProducts/similarProductController";

const router = Router();

router.get("/:foodId", verifyDeviceToken, fetchSimilarProducts);
router.get("/byId/:id", verifyDeviceToken, fetchProductById);

export default router;
