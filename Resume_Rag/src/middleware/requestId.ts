import { NextFunction, Request, Response } from "express";
import { v4 as uuid } from "uuid";

export function requestId(request: Request, response: Response, next: NextFunction): void {
  const id = request.header("x-request-id") ?? uuid();
  response.setHeader("x-request-id", id);
  (request as Request & { requestId?: string }).requestId = id;
  next();
}
