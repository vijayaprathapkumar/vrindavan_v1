import express from "express";
import {
  fetchDeals,
  addDeal,
  fetchDealById,
  updateDeal,
  removeDeal,
} from "../../controllers/dealOfTheDay/dealOfTheDayController";
import { verifyDeviceToken } from "../../middlewares/authMiddleware";

const router = express.Router();

router.get("/",verifyDeviceToken, fetchDeals);
router.post("/",verifyDeviceToken, addDeal);
router.get("/:id",verifyDeviceToken, fetchDealById);
router.put("/:id",verifyDeviceToken, updateDeal);
router.delete("/:id",verifyDeviceToken, removeDeal);

export default router;
