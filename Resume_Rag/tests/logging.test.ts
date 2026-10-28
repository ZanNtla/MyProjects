import test from "node:test";
import assert from "node:assert/strict";
import { logger } from "../src/middleware/logger";

test("logger emits a structured payload without embedding data", () => {
  const captured: string[] = [];
  const originalLog = console.log;
  console.log = (...args: unknown[]) => { captured.push(String(args[0])); };

  const request = {
    header: () => "req-123",
    method: "POST",
    originalUrl: "/v1/resume/ingest",
  } as any;

  const response = {
    statusCode: 200,
    on: (_event: string, callback: () => void) => {
      callback();
      return response;
    },
  } as any;

  try {
    logger(request, response, () => {});
    assert.equal(captured.length > 0, true);
    assert.match(captured[0], /"requestId":"req-123"/);
    assert.doesNotMatch(captured[0], /embedding/i);
  } finally {
    console.log = originalLog;
  }
});
