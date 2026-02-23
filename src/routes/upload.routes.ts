import { Router } from "express";
import { uploadFile } from "../controllers/upload.controller";
import { upload } from "../middlewares/upload.middleware";
import authMiddleware from "../middlewares/auth.middleware";

const router = Router();

router.post("/", authMiddleware, upload.single("file"), uploadFile);

export default router;
