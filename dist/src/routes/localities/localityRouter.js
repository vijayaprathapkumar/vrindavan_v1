"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const localityController_1 = require("../../controllers/localities/localityController");
const authMiddleware_1 = require("../../middlewares/authMiddleware");
const router = express_1.default.Router();
router.get('/', authMiddleware_1.verifyDeviceToken, localityController_1.getLocalities);
router.post('/', authMiddleware_1.verifyDeviceToken, localityController_1.addLocality);
router.get('/:id', authMiddleware_1.verifyDeviceToken, localityController_1.getLocality);
router.put('/:id', authMiddleware_1.verifyDeviceToken, localityController_1.updateLocality);
router.delete('/:id', authMiddleware_1.verifyDeviceToken, localityController_1.deleteLocality);
exports.default = router;
