"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const truckRoutesController_1 = require("../../controllers/localities/truckRoutesController");
const authMiddleware_1 = require("../../middlewares/authMiddleware");
const router = express_1.default.Router();
router.get("/", authMiddleware_1.verifyDeviceToken, truckRoutesController_1.getTruckRoutes);
router.post("/", authMiddleware_1.verifyDeviceToken, truckRoutesController_1.addTruckRoute);
router.get("/:id", authMiddleware_1.verifyDeviceToken, truckRoutesController_1.getTruckRoute);
router.put("/:id", truckRoutesController_1.updateTruckRoute, authMiddleware_1.verifyDeviceToken);
router.delete("/:id", authMiddleware_1.verifyDeviceToken, truckRoutesController_1.deleteTruckRoute);
exports.default = router;
