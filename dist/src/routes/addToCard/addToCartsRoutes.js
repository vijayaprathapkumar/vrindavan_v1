"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const addToCartsControllers_1 = require("../../controllers/addToCard/addToCartsControllers");
const router = express_1.default.Router();
router.get("/:userId", addToCartsControllers_1.fetchCartItems);
router.post("/", addToCartsControllers_1.addCart);
router.put("/:id", addToCartsControllers_1.updateCart);
router.delete("/:id", addToCartsControllers_1.removeCart);
exports.default = router;
