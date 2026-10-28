import test from "node:test";
import assert from "node:assert/strict";
import { AlgorithmResumeParser } from "../src/modules/ingestion/services/AlgorithmResumeParser";

test("AlgorithmResumeParser extracts core resume metadata from cleaned text", () => {
  const parser = new AlgorithmResumeParser();

  const rawText = [
    "Rajesh Mohan Kumar",
    "Test Architect & Senior Agentic Test Engineer",
    "Testleaf Software Solutions Private Limited",
    "Email: rajesh.mohan@gmail.com",
    "Phone: +91 98765 43210",
    "B.Tech - Information Technology",
    "13+ years of experience in Selenium WebDriver, Python, RAG, DeepEval and MCP (Model Context Protocol).",
  ].join("\n");

  const resume = parser.parseResume(rawText);

  assert.equal(resume.name, "Rajesh Mohan Kumar");
  assert.equal(resume.role, "Test Architect & Senior Agentic Test Engineer");
  assert.equal(resume.company, "Testleaf Software Solutions Private Limited");
  assert.equal(resume.education, "B.Tech - Information Technology");
  assert.equal(resume.totalExperience, 13);
  assert.ok(resume.skills.includes("Selenium WebDriver"));
  assert.ok(resume.skills.includes("Python"));
  assert.ok(resume.skills.includes("RAG"));
  assert.ok(resume.skills.includes("DeepEval"));
  assert.ok(resume.skills.includes("MCP (Model Context Protocol)"));
});
