import express from "express";

import { verifyDeviceToken } from "../../middlewares/authMiddleware";
import { getGuestByUsers } from "../../controllers/guest/guestController";

const router = express.Router();

// GET user by email
router.get("/", getGuestByUsers);

export default router;
