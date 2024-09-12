"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const hubsController_1 = require("../../controllers/localities/hubsController");
const hubValidation_1 = require("../../validation/localities/hubValidation");
const router = express_1.default.Router();
router.get('/', hubsController_1.getHubs);
router.post('/', hubValidation_1.hubValidation, hubValidation_1.validate, hubsController_1.addHub);
router.get('/:id', hubValidation_1.hubIdValidation, hubValidation_1.validate, hubsController_1.getHub);
router.put('/:id', hubValidation_1.hubIdValidation, hubValidation_1.hubValidation, hubValidation_1.validate, hubsController_1.updateHub);
router.delete('/:id', hubValidation_1.hubIdValidation, hubValidation_1.validate, hubsController_1.deleteHub);
exports.default = router;
