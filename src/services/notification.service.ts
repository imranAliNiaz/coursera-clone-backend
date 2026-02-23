import { prisma } from "../config/prisma";
import type { Prisma } from "@prisma/client";
import { getIo } from "../socket";
import type { CreateNotificationInput } from "../types/notification.types";

export const createNotification = async (data: CreateNotificationInput) => {
  const notification = await prisma.notification.create({
    data: {
      userId: data.userId,
      type: data.type,
      title: data.title,
      message: data.message,
      link: data.link,
      imageUrl: data.imageUrl,
      meta: data.meta as unknown as Prisma.JsonValue,
      readAt: null,
    },
  });
  const io = getIo();
  if (io) {
    const unreadCount = await prisma.notification.count({
      where: { userId: data.userId, readAt: null },
    });
    io.to(`user:${data.userId}`).emit("notification:new", {
      notification,
      unreadCount,
    });
  }
  return notification;
};

export const getMyNotifications = async (userId: string, limit = 20) => {
  return await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
};

export const markAllRead = async (userId: string) => {
  return await prisma.notification.updateMany({
    where: { userId, readAt: null },
    data: { readAt: new Date() },
  });
};

export const getUnreadCount = async (userId: string) => {
  return await prisma.notification.count({
    where: { userId, readAt: null },
  });
};
