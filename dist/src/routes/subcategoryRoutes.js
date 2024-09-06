"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const subcategoryController_1 = require("../controllers/subcategoryController");
const router = express_1.default.Router();
// Route to fetch all subcategories
router.get('/', subcategoryController_1.getSubcategories);
// Route to add a new subcategory
router.post('/', subcategoryController_1.addSubcategory);
// Route to get subcategory by ID
router.get('/:id', subcategoryController_1.getSubcategory);
exports.default = router;
