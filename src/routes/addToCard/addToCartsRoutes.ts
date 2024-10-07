import express from "express";
import {
  fetchCartItems,
  addCart,
  updateCart,
  removeCart,
} from "../../controllers/addToCard/addToCartsControllers";
import { verifyDeviceToken } from "../../middlewares/authMiddleware";

const router = express.Router();


router.get("/:userId", verifyDeviceToken,fetchCartItems);

router.post("/",verifyDeviceToken, addCart);

router.put("/:id",verifyDeviceToken, updateCart);

router.delete("/:id",verifyDeviceToken, removeCart);

export default router;
