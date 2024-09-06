"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const productTypeController_1 = require("../controllers/productTypeController");
const router = express_1.default.Router();
// Route to fetch all product types
router.get('/', productTypeController_1.getProductTypes);
// Route to add a new product type
router.post('/', productTypeController_1.addProductType);
exports.default = router;
