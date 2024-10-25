import express from 'express';
import {
  getCustomers,
  addCustomer,
  getCustomer,
  updateCustomer,
  deleteCustomer
} from '../../controllers/customer/customerController';
import { verifyDeviceToken } from '../../middlewares/authMiddleware';

const router = express.Router();

router.get("/",verifyDeviceToken, getCustomers);

router.post("/",verifyDeviceToken,  addCustomer);

router.get("/:id",verifyDeviceToken, getCustomer);

router.put("/:id",verifyDeviceToken, updateCustomer);

router.delete("/:id",verifyDeviceToken, deleteCustomer);

export default router;
