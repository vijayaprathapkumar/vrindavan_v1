"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const customerController_1 = require("../../controllers/customerController/customerController");
const customerValidation_1 = require("../../validation/customerValidation/customerValidation");
const router = express_1.default.Router();
router.get("/", customerController_1.getCustomers);
router.post("/", customerValidation_1.customerValidation, customerValidation_1.validate, customerController_1.addCustomer);
router.get("/:id", customerValidation_1.customerIdValidation, customerValidation_1.validate, customerController_1.getCustomer);
router.put("/:id", customerValidation_1.customerIdValidation, customerValidation_1.customerValidation, customerValidation_1.validate, customerController_1.updateCustomer);
router.delete("/:id", customerValidation_1.customerIdValidation, customerValidation_1.validate, customerController_1.deleteCustomer);
exports.default = router;
