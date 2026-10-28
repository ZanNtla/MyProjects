import { ErrorRequestHandler } from "express";
import multer from "multer";

export const errorHandler: ErrorRequestHandler = (error, request, response, _next) => {
  const requestId = typeof request?.header === "function" ? request.header("x-request-id") ?? "unknown" : "unknown";
  const hasCode = (candidate: unknown, code: string): boolean => {
    return !!candidate && typeof candidate === "object" && "code" in candidate && candidate.code === code;
  };

  if ((error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") || hasCode(error, "LIMIT_FILE_SIZE")) {
    response.status(413).json({
      success: false,
      requestId,
      errorCode: "FILE_TOO_LARGE",
      message: "Resume exceeds maximum upload size",
    });
    return;
  }

  if ((error instanceof multer.MulterError && error.code === "INVALID_FILE_TYPE") || hasCode(error, "INVALID_FILE_TYPE")) {
    response.status(415).json({
      success: false,
      requestId,
      errorCode: "INVALID_FILE_TYPE",
      message: "Only PDF files are allowed",
    });
    return;
  }

  if (error instanceof Error && /resume|parse|embedding|mongo/i.test(error.message)) {
    response.status(422).json({
      success: false,
      requestId,
      errorCode: "RESUME_PARSE_FAILED",
      message: error.message,
    });
    return;
  }

  response.status(500).json({
    success: false,
    requestId,
    errorCode: "INTERNAL_SERVER_ERROR",
    message: "An unexpected error occurred",
  });
};
