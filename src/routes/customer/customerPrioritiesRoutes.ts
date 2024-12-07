import { Router } from "express";
import { updateCustomerPriority } from "../../controllers/customer/customerPrioritiesController";
import { verifyDeviceToken } from "../../middlewares/authMiddleware";

const router = Router();

router.post("/", verifyDeviceToken, updateCustomerPriority);

export default router;