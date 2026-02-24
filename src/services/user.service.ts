import { prisma } from "../config/prisma";
import type { Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import type {
  GoogleUserData,
  WorkExperience,
  WorkExperienceInput,
  Education,
  EducationInput,
  ProfileCertificate,
  ProfileCertificateInput,
  UserAdminCreateInput,
} from "../types/user.types";

export const upsertGoogleUser = async (data: GoogleUserData) => {
  const { email, name, providerId, avatarUrl } = data;

  return await prisma.user.upsert({
    where: { email },
    update: {
      name,
      avatarUrl,
      provider: "google",
      providerId,
    },
    create: {
      email,
      name,
      avatarUrl,
      provider: "google",
      providerId,
      role: "student",
    },
  });
};

export const getAllUsers = async (page = 1, limit = 10, role?: string) => {
  const skip = (page - 1) * limit;
  const where = role ? { role } : {};

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatarUrl: true,
        provider: true,
        createdAt: true,
        _count: {
          select: {
            courses: true,
            enrollments: true,
          },
        },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    users,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  };
};

export const getUserById = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      avatarUrl: true,
      provider: true,
      workExperiences: true,
      educations: true,
      profileCertificates: true,
      createdAt: true,
      _count: {
        select: {
          courses: true,
          enrollments: true,
        },
      },
    },
  });

  if (!user) throw new Error("User not found");
  return user;
};

export const updateUserRole = async (id: string, role: string) => {
  return await prisma.user.update({
    where: { id },
    data: { role },
  });
};

export const updateUserProfile = async (
  id: string,
  data: { name?: string; avatarUrl?: string },
) => {
  return await prisma.user.update({
    where: { id },
    data,
  });
};

export const adminCreateUser = async (data: UserAdminCreateInput) => {
  const { name, email, password, role } = data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new Error("User already exists");

  const passwordHash = password ? await bcrypt.hash(password, 10) : undefined;

  return await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role,
      provider: "email",
    },
  });
};

export const deleteUser = async (id: string) => {
  return await prisma.user.delete({
    where: { id },
  });
};

export const getMyWorkExperiences = async (userId: string) => {
  const user = await getUserById(userId);
  return (user.workExperiences as WorkExperience[] | null) || [];
};

export const addMyWorkExperience = async (
  userId: string,
  data: WorkExperienceInput,
) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { workExperiences: true },
  });

  if (!user) throw new Error("User not found");

  const current = (user.workExperiences as WorkExperience[] | null) || [];
  const newItem: WorkExperience = {
    id: crypto.randomUUID(),
    title: data.title.trim(),
    company: data.company.trim(),
    location: data.location?.trim() || "",
    employmentType: data.employmentType?.trim() || "",
    startDate: data.startDate,
    endDate: data.endDate || "",
    isCurrent: Boolean(data.isCurrent),
    description: data.description?.trim() || "",
    createdAt: new Date().toISOString(),
  };

  await prisma.user.update({
    where: { id: userId },
    data: {
      workExperiences: [newItem, ...current] as unknown as Prisma.JsonArray,
    },
  });

  return newItem;
};

export const updateMyWorkExperience = async (
  userId: string,
  experienceId: string,
  data: WorkExperienceInput,
) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { workExperiences: true },
  });

  if (!user) throw new Error("User not found");

  const current = (user.workExperiences as WorkExperience[] | null) || [];
  const idx = current.findIndex((item) => item.id === experienceId);
  if (idx === -1) throw new Error("Work experience not found");

  const updatedItem: WorkExperience = {
    ...current[idx],
    title: data.title.trim(),
    company: data.company.trim(),
    location: data.location?.trim() || "",
    employmentType: data.employmentType?.trim() || "",
    startDate: data.startDate,
    endDate: data.endDate || "",
    isCurrent: Boolean(data.isCurrent),
    description: data.description?.trim() || "",
    updatedAt: new Date().toISOString(),
  };

  const updatedList = [...current];
  updatedList[idx] = updatedItem;

  await prisma.user.update({
    where: { id: userId },
    data: { workExperiences: updatedList as unknown as Prisma.JsonArray },
  });

  return updatedItem;
};

export const deleteMyWorkExperience = async (
  userId: string,
  experienceId: string,
) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { workExperiences: true },
  });

  if (!user) throw new Error("User not found");

  const current = (user.workExperiences as WorkExperience[] | null) || [];
  const updatedList = current.filter((item) => item.id !== experienceId);

  await prisma.user.update({
    where: { id: userId },
    data: { workExperiences: updatedList as unknown as Prisma.JsonArray },
  });

  return { id: experienceId };
};

export const getMyEducations = async (userId: string) => {
  const user = await getUserById(userId);
  return (user.educations as Education[] | null) || [];
};

export const addMyEducation = async (userId: string, data: EducationInput) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { educations: true },
  });

  if (!user) throw new Error("User not found");

  const current = (user.educations as Education[] | null) || [];
  const newItem: Education = {
    id: crypto.randomUUID(),
    instituteName: data.instituteName.trim(),
    degreeDetails: data.degreeDetails.trim(),
    startDate: data.startDate,
    endDate: data.endDate,
    createdAt: new Date().toISOString(),
  };

  await prisma.user.update({
    where: { id: userId },
    data: {
      educations: [newItem, ...current] as unknown as Prisma.JsonArray,
    },
  });

  return newItem;
};

export const updateMyEducation = async (
  userId: string,
  educationId: string,
  data: EducationInput,
) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { educations: true },
  });

  if (!user) throw new Error("User not found");

  const current = (user.educations as Education[] | null) || [];
  const idx = current.findIndex((item) => item.id === educationId);
  if (idx === -1) throw new Error("Education not found");

  const updatedItem: Education = {
    ...current[idx],
    instituteName: data.instituteName.trim(),
    degreeDetails: data.degreeDetails.trim(),
    startDate: data.startDate,
    endDate: data.endDate,
    updatedAt: new Date().toISOString(),
  };

  const updatedList = [...current];
  updatedList[idx] = updatedItem;

  await prisma.user.update({
    where: { id: userId },
    data: { educations: updatedList as unknown as Prisma.JsonArray },
  });

  return updatedItem;
};

export const deleteMyEducation = async (
  userId: string,
  educationId: string,
) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { educations: true },
  });

  if (!user) throw new Error("User not found");

  const current = (user.educations as Education[] | null) || [];
  const updatedList = current.filter((item) => item.id !== educationId);

  await prisma.user.update({
    where: { id: userId },
    data: { educations: updatedList as unknown as Prisma.JsonArray },
  });

  return { id: educationId };
};

export const getMyProfileCertificates = async (userId: string) => {
  const user = await getUserById(userId);
  return (user.profileCertificates as ProfileCertificate[] | null) || [];
};

export const addMyProfileCertificate = async (
  userId: string,
  data: ProfileCertificateInput,
) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { profileCertificates: true },
  });

  if (!user) throw new Error("User not found");

  const current =
    (user.profileCertificates as ProfileCertificate[] | null) || [];
  const newItem: ProfileCertificate = {
    id: crypto.randomUUID(),
    certificateName: data.certificateName.trim(),
    completionDate: data.completionDate,
    createdAt: new Date().toISOString(),
  };

  await prisma.user.update({
    where: { id: userId },
    data: {
      profileCertificates: [newItem, ...current] as unknown as Prisma.JsonArray,
    },
  });

  return newItem;
};

export const updateMyProfileCertificate = async (
  userId: string,
  certificateId: string,
  data: ProfileCertificateInput,
) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { profileCertificates: true },
  });

  if (!user) throw new Error("User not found");

  const current =
    (user.profileCertificates as ProfileCertificate[] | null) || [];
  const idx = current.findIndex((item) => item.id === certificateId);
  if (idx === -1) throw new Error("Profile certificate not found");

  const updatedItem: ProfileCertificate = {
    ...current[idx],
    certificateName: data.certificateName.trim(),
    completionDate: data.completionDate,
    updatedAt: new Date().toISOString(),
  };

  const updatedList = [...current];
  updatedList[idx] = updatedItem;

  await prisma.user.update({
    where: { id: userId },
    data: { profileCertificates: updatedList as unknown as Prisma.JsonArray },
  });

  return updatedItem;
};

export const deleteMyProfileCertificate = async (
  userId: string,
  certificateId: string,
) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { profileCertificates: true },
  });

  if (!user) throw new Error("User not found");

  const current =
    (user.profileCertificates as ProfileCertificate[] | null) || [];
  const updatedList = current.filter((item) => item.id !== certificateId);

  await prisma.user.update({
    where: { id: userId },
    data: { profileCertificates: updatedList as unknown as Prisma.JsonArray },
  });

  return { id: certificateId };
};
