import { Request, Response } from "express";
import type { AuthenticatedRequest } from "../types/auth";
import asyncHandler from "../utils/asyncHandler";
import * as certificateService from "../services/certificate.service";

export const getMyCertificates = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    const certificates = await certificateService.getMyCertificates(userId);
    res.json(certificates);
  },
);

export const getCertificateById = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    const { id } = req.params;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    const certificate = await certificateService.getCertificateById(
      id as string,
      userId,
    );
    res.json(certificate);
  },
);

export const verifyCertificate = asyncHandler(
  async (req: Request, res: Response) => {
    const { code } = req.params;
    const certificate = await certificateService.verifyCertificate(
      code as string,
    );
    res.json(certificate);
  },
);

export const downloadCertificate = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    const { id } = req.params;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    const cert = await certificateService.getCertificateById(
      id as string,
      userId,
    );
    if (!cert.pdfUrl) {
      res.status(404).json({ message: "Certificate file not found" });
      return;
    }
    res.redirect(cert.pdfUrl);
  },
);
