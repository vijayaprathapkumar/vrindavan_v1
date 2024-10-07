"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const hubsController_1 = require("../../controllers/localities/hubsController");
const hubValidation_1 = require("../../validation/localities/hubValidation");
const authMiddleware_1 = require("../../middlewares/authMiddleware");
const router = express_1.default.Router();
router.get('/', authMiddleware_1.verifyDeviceToken, hubsController_1.getHubs);
router.post('/', authMiddleware_1.verifyDeviceToken, hubValidation_1.hubValidation, hubValidation_1.validate, hubsController_1.addHub);
router.get('/:id', authMiddleware_1.verifyDeviceToken, hubValidation_1.hubIdValidation, hubValidation_1.validate, hubsController_1.getHub);
router.put('/:id', authMiddleware_1.verifyDeviceToken, hubValidation_1.hubIdValidation, hubValidation_1.hubValidation, hubValidation_1.validate, hubsController_1.updateHub);
router.delete('/:id', authMiddleware_1.verifyDeviceToken, hubValidation_1.hubIdValidation, hubValidation_1.validate, hubsController_1.deleteHub);
exports.default = router;
