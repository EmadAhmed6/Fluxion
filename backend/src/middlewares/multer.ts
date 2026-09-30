import type { Request } from "express";
import type { Error } from "mongoose";
import multer from "multer";
const storage = multer.diskStorage({
  filename: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void,
  ) => {
    cb(null, file.originalname);
  },
});

const upload = multer({
  dest: "uploads",
  limits: { fileSize: 100 * 1024 * 1024 },
});

export default upload;
