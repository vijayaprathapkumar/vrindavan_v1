import express from 'express';
import {
  getCustomers,
  addCustomer,
  getCustomer,
  updateCustomer,
  deleteCustomer
} from '../../controllers/customer/customerController';
import {
  customerValidation,
  customerIdValidation,
  validate
} from '../../validation/customer/customerValidation';
import { verifyDeviceToken } from '../../middlewares/authMiddleware';

const router = express.Router();

router.get("/",verifyDeviceToken, getCustomers);

router.post("/",verifyDeviceToken, customerValidation, validate, addCustomer);

router.get("/:id",verifyDeviceToken, customerIdValidation, validate, getCustomer);

router.put("/:id",verifyDeviceToken, customerIdValidation, customerValidation, validate, updateCustomer);

router.delete("/:id",verifyDeviceToken, customerIdValidation, validate, deleteCustomer);

export default router;
