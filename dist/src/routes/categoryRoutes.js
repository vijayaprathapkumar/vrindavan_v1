"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const categoryController_1 = require("../controllers/categoryController");
const router = express_1.default.Router();
// Route to fetch all categories
router.get('/', categoryController_1.getCategories);
// Route to add a new category
router.post('/', categoryController_1.addCategory);
// Route to get category by ID
router.get('/:id', categoryController_1.getCategory);
exports.default = router;
