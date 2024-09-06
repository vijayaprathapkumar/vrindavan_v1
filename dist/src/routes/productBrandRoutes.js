"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const productBrandController_1 = require("../controllers/productBrandController");
const router = express_1.default.Router();
// Route to fetch all product brands
router.get('/', productBrandController_1.getProductBrands);
// Route to add a new product brand
router.post('/', productBrandController_1.addProductBrand);
exports.default = router;
