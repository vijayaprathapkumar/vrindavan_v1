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

const router = express.Router();

router.get("/", getTruckRoutes);
router.post("/", truckRouteValidation, validate, addTruckRoute);
router.get("/:id", truckRouteIdValidation, validate, getTruckRoute);
router.put(
  "/:id",
  truckRouteIdValidation,
  truckRouteValidation,
  validate,
  updateTruckRoute
);
router.delete("/:id", truckRouteIdValidation, validate, deleteTruckRoute);

export default router;
