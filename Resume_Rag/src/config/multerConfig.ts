import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import multer from "multer";

const uploadDirectory = path.resolve(process.cwd(), "uploads");
fs.mkdirSync(uploadDirectory, { recursive: true });

const storage = multer.diskStorage({
  destination: (_request, _file, callback) => {
    callback(null, uploadDirectory);
  },
  filename: (_request, _file, callback) => {
    callback(null, `${crypto.randomUUID()}.pdf`);
  },
});

export const uploadResume = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (_request, file, callback) => {
    const isPdfExtension = path.extname(file.originalname).toLowerCase() === ".pdf";
    const isPdfMimeType = file.mimetype === "application/pdf";

    if (!isPdfExtension || !isPdfMimeType) {
      const error = new Error("Only PDF files are allowed") as Error & { code: string };
      error.code = "INVALID_FILE_TYPE";
      callback(error);
      return;
    }

    callback(null, true);
  },
});
