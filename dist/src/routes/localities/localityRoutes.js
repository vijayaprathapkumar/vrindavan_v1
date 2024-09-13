"use strict";
// routes/locality/localityRoutes.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const localityController_1 = require("../../controllers/localities/localityController");
const localityValidation_1 = require("../../validation/localities/localityValidation");
const router = express_1.default.Router();
// Fetch all localities
router.get("/", localityController_1.getLocalities);
// Add a new locality
router.post("/", localityValidation_1.localityValidation, localityValidation_1.validate, localityController_1.addLocality);
// Fetch locality by ID
router.get("/:id", localityValidation_1.localityIdValidation, localityValidation_1.validate, localityController_1.getLocality);
// Update locality by ID
router.put("/:id", localityValidation_1.localityIdValidation, localityValidation_1.localityValidation, localityValidation_1.validate, localityController_1.updateLocality);
// Delete locality by ID
router.delete("/:id", localityValidation_1.localityIdValidation, localityValidation_1.validate, localityController_1.deleteLocality);
exports.default = router;
