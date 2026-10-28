import test from "node:test";
import assert from "node:assert/strict";
import { detectSkills } from "../src/config/skills";
import { cleanResumeText } from "../src/modules/ingestion/utils/textCleaner";
import { extractEmail, extractExperienceYears, extractPhone } from "../src/modules/ingestion/utils/regex";

test("cleanResumeText normalizes whitespace and preserves technical terms", () => {
  const input = "  Rajesh Mohan Kumar\n\n\nTest Architect & Senior Agentic Test Engineer   \n   RAG\n\nC#    .NET\n\n";

  const result = cleanResumeText(input);

  assert.equal(
    result,
    "Rajesh Mohan Kumar\nTest Architect & Senior Agentic Test Engineer\nRAG\nC# .NET",
  );
});

test("extractEmail extracts the email address from resume text", () => {
  assert.equal(extractEmail("Contact: rajesh.mohan@gmail.com"), "rajesh.mohan@gmail.com");
});

test("extractPhone extracts the phone number from resume text", () => {
  assert.equal(extractPhone("Phone: +91 98765 43210"), "+91 98765 43210");
});

test("extractExperienceYears extracts years from text", () => {
  assert.equal(extractExperienceYears("13+ years of experience"), 13);
});

test("detectSkills finds known resume skills from text", () => {
  const skills = detectSkills("Experienced in Selenium WebDriver, Python, RAG, DeepEval and MCP (Model Context Protocol)." );

  assert.deepEqual(skills, [
    "Selenium",
    "Python",
    "RAG",
    "DeepEval",
    "MCP (Model Context Protocol)",
    "Selenium WebDriver",
    "MCP",
  ]);
});
