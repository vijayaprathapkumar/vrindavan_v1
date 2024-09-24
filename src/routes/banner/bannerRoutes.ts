import { Router } from "express";
import {
  fetchBanners,
  addBanner,
  fetchBannerById,
  updateBanner,
  deleteBanner,
} from "../../controllers/banner/bannerControllers";

const router = Router();

router.get("/", fetchBanners);

router.post("/", addBanner);

router.get("/:id", fetchBannerById);

router.put("/:id", updateBanner);

router.delete("/:id", deleteBanner);

export default router;
