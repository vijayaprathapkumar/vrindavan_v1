import express from "express";
import {
  fetchDeals,
  addDeal,
  fetchDealById,
  updateDealById,
  removeDeal,
} from "../../controllers/dealOfTheDay/dealOfTheDayController";

const router = express.Router();

router.get("/", fetchDeals);
router.post("/", addDeal);
router.get("/:id", fetchDealById);
router.put("/:id", updateDealById);
router.delete("/:id", removeDeal);

export default router;
