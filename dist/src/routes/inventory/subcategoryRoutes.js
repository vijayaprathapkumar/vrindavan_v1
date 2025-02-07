"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../../middlewares/authMiddleware");
const subcategoryController_1 = require("../../controllers/inventory/subcategoryController");
const router = express_1.default.Router();
router.get("/", authMiddleware_1.verifyDeviceToken, subcategoryController_1.getSubcategories);
router.post("/", authMiddleware_1.verifyDeviceToken, subcategoryController_1.addSubcategory);
router.get("/:id", authMiddleware_1.verifyDeviceToken, subcategoryController_1.getSubcategory);
router.put("/:id", authMiddleware_1.verifyDeviceToken, subcategoryController_1.updateSubcategory);
router.delete("/:id", authMiddleware_1.verifyDeviceToken, subcategoryController_1.deleteSubcategory);
exports.default = router;
