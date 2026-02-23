import { Router } from "express";
import {
  syncGoogleUser,
  getUsers,
  getUser,
  getMe,
  updateRole,
  updateProfile,
  deleteUserById,
  createUser,
  getMyWorkExperience,
  addMyWorkExperienceItem,
  updateMyWorkExperienceItem,
  deleteMyWorkExperienceItem,
  getMyEducationItems,
  addMyEducationItem,
  updateMyEducationItem,
  deleteMyEducationItem,
  getMyProfileCertificateItems,
  addMyProfileCertificateItem,
  updateMyProfileCertificateItem,
  deleteMyProfileCertificateItem,
} from "../controllers/user.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/role.middleware";

const router = Router();

router.post("/sync-google", syncGoogleUser);

router.get("/me", authMiddleware, getMe);
router.patch("/me", authMiddleware, updateProfile);
router.get("/me/work-experiences", authMiddleware, getMyWorkExperience);
router.post("/me/work-experiences", authMiddleware, addMyWorkExperienceItem);
router.put(
  "/me/work-experiences/:experienceId",
  authMiddleware,
  updateMyWorkExperienceItem,
);
router.delete(
  "/me/work-experiences/:experienceId",
  authMiddleware,
  deleteMyWorkExperienceItem,
);
router.get("/me/educations", authMiddleware, getMyEducationItems);
router.post("/me/educations", authMiddleware, addMyEducationItem);
router.put(
  "/me/educations/:educationId",
  authMiddleware,
  updateMyEducationItem,
);
router.delete(
  "/me/educations/:educationId",
  authMiddleware,
  deleteMyEducationItem,
);
router.get(
  "/me/profile-certificates",
  authMiddleware,
  getMyProfileCertificateItems,
);
router.post(
  "/me/profile-certificates",
  authMiddleware,
  addMyProfileCertificateItem,
);
router.put(
  "/me/profile-certificates/:certificateId",
  authMiddleware,
  updateMyProfileCertificateItem,
);
router.delete(
  "/me/profile-certificates/:certificateId",
  authMiddleware,
  deleteMyProfileCertificateItem,
);

router.get("/", authMiddleware, requireRole(["admin"]), getUsers);
router.post("/", authMiddleware, requireRole(["admin"]), createUser);
router.get("/:id", authMiddleware, requireRole(["admin"]), getUser);
router.patch("/:id/role", authMiddleware, requireRole(["admin"]), updateRole);
router.delete("/:id", authMiddleware, requireRole(["admin"]), deleteUserById);

export default router;
