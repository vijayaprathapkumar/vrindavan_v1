import express from "express";
import {
  fetchCartItems,
  addCart,
  updateCart,
  removeCart,
  fetchCartItemById,
} from "../../controllers/addToCard/addToCartsControllers";
import { verifyDeviceToken } from "../../middlewares/authMiddleware";

const router = express.Router();


router.get("/:userId", verifyDeviceToken,fetchCartItems);

router.get("/item/:id", verifyDeviceToken, fetchCartItemById);

router.post("/",verifyDeviceToken, addCart);

router.put("/:id",verifyDeviceToken, updateCart);

router.delete("/:id",verifyDeviceToken, removeCart);

export default router;
