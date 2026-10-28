import test from "node:test";
import assert from "node:assert/strict";
import { AddressInfo } from "node:net";
import { app } from "../src/app";

test("health route responds successfully", async () => {
  const server = app.listen(0);

  try {
    const { port } = server.address() as AddressInfo;
    const response = await fetch(`http://127.0.0.1:${port}/v1/health`);
    const payload = await response.json();

    assert.equal(response.status, 200);
    assert.equal(payload.status, "ok");
    assert.equal(payload.app, "resume-rag-backend");
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });
  }
});

test("parse route extracts structured resume data from raw text", async () => {
  const server = app.listen(0);

  try {
    const { port } = server.address() as AddressInfo;
    const response = await fetch(`http://127.0.0.1:${port}/v1/resume/parse`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        rawText: [
          "Rajesh Mohan Kumar",
          "Test Architect & Senior Agentic Test Engineer",
          "Testleaf Software Solutions Private Limited",
          "Email: rajesh.mohan@gmail.com",
          "Phone: +91 98765 43210",
          "B.Tech - Information Technology",
          "13+ years of experience in Selenium WebDriver, Python, RAG, DeepEval and MCP (Model Context Protocol).",
        ].join("\n"),
      }),
    });

    const payload = await response.json();

    assert.equal(response.status, 200);
    assert.equal(payload.success, true);
    assert.equal(payload.resume.name, "Rajesh Mohan Kumar");
    assert.equal(payload.resume.company, "Testleaf Software Solutions Private Limited");
    assert.equal(payload.resume.totalExperience, 13);
    assert.ok(Array.isArray(payload.resume.skills));
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });
  }
});

test("upload route rejects non-PDF files", async () => {
  const server = app.listen(0);

  try {
    const { port } = server.address() as AddressInfo;
    const formData = new FormData();
    formData.append("file", new Blob(["not a pdf"], { type: "text/plain" }), "sample.txt");

    const response = await fetch(`http://127.0.0.1:${port}/v1/resume/upload`, {
      method: "POST",
      body: formData,
    });

    const payload = await response.json();

    assert.equal(response.status, 415);
    assert.equal(payload.success, false);
    assert.equal(payload.errorCode, "INVALID_FILE_TYPE");
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });
  }
});
