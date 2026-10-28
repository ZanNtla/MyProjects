import test from "node:test";
import assert from "node:assert/strict";
import { ResumeIngestionService } from "../src/modules/ingestion/services/ResumeIngestionService";

test("ResumeIngestionService orchestrates extraction, parsing, embedding, and Mongo insert", async () => {
  const repository = {
    insertResume: async (document: Record<string, any>) => ({
      acknowledged: true,
      insertedId: "resume-123",
      document,
    }),
  };

  const service = new ResumeIngestionService(
    repository as any,
    {
      extractTextFromPdf: async () => [
        "Rajesh Mohan Kumar",
        "Test Architect & Senior Agentic Test Engineer",
        "Testleaf Software Solutions Private Limited",
        "Email: rajesh.mohan@gmail.com",
        "Phone: +91 98765 43210",
        "B.Tech - Information Technology",
        "13+ years of experience in Selenium WebDriver, Python, RAG, DeepEval and MCP (Model Context Protocol).",
      ].join("\n"),
    } as any,
    {
      parseResume: (rawText: string) => ({
        name: "Rajesh Mohan Kumar",
        role: "Test Architect & Senior Agentic Test Engineer",
        company: "Testleaf Software Solutions Private Limited",
        education: "B.Tech - Information Technology",
        totalExperience: 13,
        skills: ["Selenium WebDriver", "Python", "RAG", "DeepEval", "MCP (Model Context Protocol)"],
        experienceSummary: "Experience of 13 years with focus on Selenium WebDriver, Python, RAG, DeepEval, MCP (Model Context Protocol).",
      }),
    } as any,
    {
      generateEmbedding: async (text: string) => ({
        embedding: [0.1, -0.2, 0.3],
        model: "mistral-embed",
        dimension: 3,
        text,
      }),
    } as any,
  );

  const file = { path: "resume.pdf" } as any;
  const result = await service.ingestResume(file);

  assert.equal(result.success, true);
  assert.equal(result.message, "Resume ingestion completed");
  assert.equal(result.resumeId, "resume-123");
  assert.equal(result.data.name, "Rajesh Mohan Kumar");
  assert.equal(result.data.company, "Testleaf Software Solutions Private Limited");
  assert.equal(result.data.embeddingModel, "mistral-embed");
  assert.equal(result.timings.totalMs >= result.timings.extractMs, true);
});
