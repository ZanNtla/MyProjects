import test from "node:test";
import assert from "node:assert/strict";
import { errorHandler } from "../src/middleware/errorHandler";
import { requestId } from "../src/middleware/requestId";

test("requestId attaches a request ID to the response", () => {
  const request = { header: () => undefined } as any;
  const response = { setHeader: (name: string, value: string) => {
    assert.equal(name, "x-request-id");
    assert.ok(value.length > 0);
  } } as any;

  requestId(request, response, () => {});
});

test("errorHandler returns a stable payload for file-size violations", () => {
  const response = {
    statusCode: 0,
    body: undefined as any,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: any) {
      this.body = payload;
      return this;
    },
  } as any;

  const error = { code: "LIMIT_FILE_SIZE" };
  errorHandler(error as any, {} as any, response, () => {});

  assert.equal(response.statusCode, 413);
  assert.equal(response.body.errorCode, "FILE_TOO_LARGE");
  assert.equal(response.body.message, "Resume exceeds maximum upload size");
});
