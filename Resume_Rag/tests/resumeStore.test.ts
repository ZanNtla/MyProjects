import test from "node:test";
import assert from "node:assert/strict";
import { ResumeIngestionRepository } from "../src/modules/ingestion/repositories/ResumeIngestionRepository";
import { storeResumeController } from "../src/modules/ingestion/controllers/ingestionController";

test("storeResumeController persists the uploaded resume payload", async () => {
  const req = {
    app: {
      locals: {
        resumeRepository: {
          insertResume: async (document: Record<string, any>) => ({
            acknowledged: true,
            insertedId: "doc-123",
            document,
          }),
        },
      },
    },
    body: {
      fileName: "Rajesh Mohan Kumar_Test Architect & Senior Agentic Test Engineer.pdf",
      resume: {
        name: "Rajesh Mohan Kumar",
        role: "Test Architect & Senior Agentic Test Engineer",
        skills: ["RAG", "DeepEval", "MCP (Model Context Protocol)"]
      },
      rawText: "Rajesh Mohan Kumar\nTest Architect & Senior Agentic Test Engineer",
      embedding: [0.1, -0.2, 0.3]
    }
  } as any;

  const res = {
    statusCode: 0,
    body: undefined as any,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: any) {
      this.body = payload;
      return this;
    }
  } as any;

  await storeResumeController(req, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.success, true);
  assert.equal(res.body.message, "Resume stored successfully");
});

test("ResumeIngestionRepository inserts a document with metadata timestamps", async () => {
  const inserted: Record<string, any>[] = [];
  const repository = new ResumeIngestionRepository({
    collection: () => ({
      insertOne: async (document: Record<string, any>) => {
        inserted.push(document);
        return { acknowledged: true, insertedId: "doc-1" };
      }
    })
  } as any);

  const result = await repository.insertResume({
    fileName: "resume.pdf",
    name: "Rajesh Mohan Kumar",
    company: "Testleaf Software Solutions Private Limited",
    skills: ["RAG", "DeepEval"]
  });

  assert.equal(result.acknowledged, true);
  assert.equal(result.insertedId, "doc-1");
  assert.equal(inserted.length, 1);
  assert.ok(inserted[0].createdAt instanceof Date);
  assert.ok(inserted[0].updatedAt instanceof Date);
});
