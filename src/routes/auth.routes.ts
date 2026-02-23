import { Router } from "express";
import {
  login,
  register,
  changePassword,
} from "../controllers/auth.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.post("/login", login);
router.post("/register", register);
router.patch("/change-password", authMiddleware, changePassword);

export default router;
