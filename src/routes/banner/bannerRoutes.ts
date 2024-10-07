import { Router } from "express";
import {
  fetchBanners,
  addBanner,
  fetchBannerById,
  updateBanner,
  deleteBanner,
} from "../../controllers/banner/bannerControllers";
import { verifyDeviceToken } from "../../middlewares/authMiddleware";

const router = Router();

router.get("/",verifyDeviceToken, fetchBanners);
router.post("/",verifyDeviceToken, addBanner);
router.get("/:id",verifyDeviceToken, fetchBannerById);
router.put("/:id",verifyDeviceToken, updateBanner);
router.delete("/:id",verifyDeviceToken, deleteBanner);

export default router;
