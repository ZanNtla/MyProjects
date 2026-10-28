import { NextFunction, Request, Response } from "express";

export function logger(request: Request, response: Response, next: NextFunction): void {
  const startedAt = Date.now();
  const requestId = request.header("x-request-id") ?? "unknown";

  response.on("finish", () => {
    const durationMs = Date.now() - startedAt;
    const logPayload = {
      requestId,
      endpoint: request.originalUrl,
      method: request.method,
      statusCode: response.statusCode,
      durationMs,
    };

    console.log(JSON.stringify(logPayload));
  });

  next();
}
