import express from "express";
import {
  getTruckRoutes,
  addTruckRoute,
  getTruckRoute,
  updateTruckRoute,
  deleteTruckRoute,
} from "../../controllers/localities/truckRoutesController";

import { verifyDeviceToken } from "../../middlewares/authMiddleware";

const router = express.Router();

router.get("/", verifyDeviceToken, getTruckRoutes);
router.post("/", verifyDeviceToken, addTruckRoute);
router.get("/:id", verifyDeviceToken, getTruckRoute);
router.put("/:id", updateTruckRoute, verifyDeviceToken);
router.delete("/:id", verifyDeviceToken, deleteTruckRoute);

export default router;
