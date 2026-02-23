import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler";
import path from "path";
import cloudinary from "../config/cloudinary";
import { Readable } from "stream";
import type { CloudinaryUploadResult } from "../types/common.types";

export const uploadFile = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    res.status(400).json({ message: "No file uploaded" });
    return;
  }

  const isVideo = req.file.mimetype.startsWith("video/");
  const folder = process.env.CLOUDINARY_FOLDER || "coursera-clone";
  const publicId = `${Date.now()}-${path.parse(req.file.originalname).name}`;

  const uploadResult = await new Promise<CloudinaryUploadResult>(
    (resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: isVideo ? "video" : "image",
          folder,
          public_id: publicId,
        },
        (error, result) => {
          if (error) reject(error);
          else if (!result)
            reject(new Error("Cloudinary upload failed: No result"));
          else resolve(result as CloudinaryUploadResult);
        },
      );

      const bufferStream = Readable.from(req.file!.buffer);
      bufferStream.pipe(uploadStream);
    },
  );

  if (!uploadResult.secure_url) {
    throw new Error("Cloudinary upload failed: No URL returned");
  }

  res.status(200).json({
    success: true,
    videoUrl: uploadResult.secure_url,
    publicId: uploadResult.public_id,
    duration: isVideo ? uploadResult.duration : undefined,
  });
});
