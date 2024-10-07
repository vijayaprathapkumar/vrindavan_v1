import express from "express";
import {
  getTruckRoutes,
  addTruckRoute,
  getTruckRoute,
  updateTruckRoute,
  deleteTruckRoute,
} from "../../controllers/localities/truckRoutesController";
import {
  truckRouteValidation,
  truckRouteIdValidation,
  validate,
} from "../../validation/localities/truckRoutesValidator";
import { verifyDeviceToken } from "../../middlewares/authMiddleware";

const router = express.Router();

router.get("/",verifyDeviceToken, getTruckRoutes);
router.post("/",verifyDeviceToken, truckRouteValidation, validate, addTruckRoute);
router.get("/:id",verifyDeviceToken, truckRouteIdValidation, validate, getTruckRoute);
router.put(
  "/:id",
  truckRouteIdValidation,
  truckRouteValidation,
  validate,
  updateTruckRoute,verifyDeviceToken,
);
router.delete("/:id",verifyDeviceToken, truckRouteIdValidation, validate, deleteTruckRoute);

export default router;
