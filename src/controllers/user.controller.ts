import { Request, Response } from "express";
import type { AuthenticatedRequest } from "../types/auth";
import {
  upsertGoogleUser,
  getAllUsers,
  getUserById,
  updateUserRole,
  updateUserProfile,
  deleteUser,
  adminCreateUser,
  getMyWorkExperiences,
  addMyWorkExperience,
  updateMyWorkExperience,
  deleteMyWorkExperience,
  getMyEducations,
  addMyEducation,
  updateMyEducation,
  deleteMyEducation,
  getMyProfileCertificates,
  addMyProfileCertificate,
  updateMyProfileCertificate,
  deleteMyProfileCertificate,
} from "../services/user.service";
import asyncHandler from "../utils/asyncHandler";
import { signToken } from "../config/jwt";
import type {
  GoogleUserData,
  WorkExperienceInput,
  EducationInput,
  ProfileCertificateInput,
} from "../types/user.types";

export const syncGoogleUser = asyncHandler(
  async (req: Request, res: Response) => {
    const { email, name, providerId, avatarUrl } = req.body as GoogleUserData;

    if (!email || !name || !providerId) {
      res.status(400).json({ message: "Missing required fields" });
      return;
    }

    const user = await upsertGoogleUser({ email, name, providerId, avatarUrl });
    const token = signToken({ sub: user.id, role: user.role });

    res.status(200).json({
      message: "User synced successfully",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        role: user.role,
      },
    });
  },
);

export const getUsers = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const role = req.query.role as string;

  const result = await getAllUsers(page, limit, role);
  res.json(result);
});

export const getUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = await getUserById(id as string);
  res.json(user);
});

export const getMe = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    const user = await getUserById(userId);
    res.json(user);
  },
);

export const updateRole = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!role) {
    res.status(400).json({ message: "Role is required" });
    return;
  }

  const user = await updateUserRole(id as string, role);
  res.json(user);
});

export const updateProfile = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    const { name, avatarUrl } = req.body;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const user = await updateUserProfile(userId, { name, avatarUrl });
    res.json(user);
  },
);

export const createUser = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !role) {
    res.status(400).json({ message: "Missing required fields" });
    return;
  }

  const user = await adminCreateUser({ name, email, password, role });
  res.status(201).json(user);
});

export const getMyWorkExperience = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const workExperiences = await getMyWorkExperiences(userId);
    res.json(workExperiences);
  },
);

export const addMyWorkExperienceItem = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const data = req.body as WorkExperienceInput;

    if (!data.title || !data.company || !data.startDate) {
      res
        .status(400)
        .json({ message: "title, company and startDate are required" });
      return;
    }

    const created = await addMyWorkExperience(userId, data);

    res.status(201).json(created);
  },
);

export const updateMyWorkExperienceItem = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    const { experienceId } = req.params;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const data = req.body as WorkExperienceInput;

    if (!data.title || !data.company || !data.startDate) {
      res
        .status(400)
        .json({ message: "title, company and startDate are required" });
      return;
    }

    const updated = await updateMyWorkExperience(
      userId,
      experienceId as string,
      data,
    );

    res.json(updated);
  },
);

export const deleteMyWorkExperienceItem = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    const { experienceId } = req.params;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const deleted = await deleteMyWorkExperience(
      userId,
      experienceId as string,
    );
    res.json({ message: "Work experience deleted", ...deleted });
  },
);

export const getMyEducationItems = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const educations = await getMyEducations(userId);
    res.json(educations);
  },
);

export const addMyEducationItem = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const data = req.body as EducationInput;

    if (
      !data.instituteName ||
      !data.degreeDetails ||
      !data.startDate ||
      !data.endDate
    ) {
      res.status(400).json({
        message:
          "instituteName, degreeDetails, startDate and endDate are required",
      });
      return;
    }

    const created = await addMyEducation(userId, data);

    res.status(201).json(created);
  },
);

export const updateMyEducationItem = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    const { educationId } = req.params;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const data = req.body as EducationInput;

    if (
      !data.instituteName ||
      !data.degreeDetails ||
      !data.startDate ||
      !data.endDate
    ) {
      res.status(400).json({
        message:
          "instituteName, degreeDetails, startDate and endDate are required",
      });
      return;
    }

    const updated = await updateMyEducation(
      userId,
      educationId as string,
      data,
    );

    res.json(updated);
  },
);

export const deleteMyEducationItem = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    const { educationId } = req.params;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const deleted = await deleteMyEducation(userId, educationId as string);
    res.json({ message: "Education deleted", ...deleted });
  },
);

export const getMyProfileCertificateItems = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const certificates = await getMyProfileCertificates(userId);
    res.json(certificates);
  },
);

export const addMyProfileCertificateItem = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const data = req.body as ProfileCertificateInput;

    if (!data.certificateName || !data.completionDate) {
      res.status(400).json({
        message: "certificateName and completionDate are required",
      });
      return;
    }

    const created = await addMyProfileCertificate(userId, data);

    res.status(201).json(created);
  },
);

export const updateMyProfileCertificateItem = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    const { certificateId } = req.params;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const data = req.body as ProfileCertificateInput;

    if (!data.certificateName || !data.completionDate) {
      res.status(400).json({
        message: "certificateName and completionDate are required",
      });
      return;
    }

    const updated = await updateMyProfileCertificate(
      userId,
      certificateId as string,
      data,
    );

    res.json(updated);
  },
);

export const deleteMyProfileCertificateItem = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    const { certificateId } = req.params;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const deleted = await deleteMyProfileCertificate(
      userId,
      certificateId as string,
    );
    res.json({ message: "Profile certificate deleted", ...deleted });
  },
);

export const deleteUserById = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = await deleteUser(id as string);
    res.json({ message: "User deleted successfully", user });
  },
);
