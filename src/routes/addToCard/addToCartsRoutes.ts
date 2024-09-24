import express from "express";
import {
  fetchCartItems,
  addCart,
  updateCart,
  removeCart,
} from "../../controllers/addToCard/addToCartsControllers";

const router = express.Router();


router.get("/:userId", fetchCartItems);

router.post("/", addCart);

router.put("/:id", updateCart);

router.delete("/:id", removeCart);

export default router;
