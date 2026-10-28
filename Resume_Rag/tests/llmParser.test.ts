import test from "node:test";
import assert from "node:assert/strict";
import { LLMResumeParser } from "../src/modules/ingestion/services/LLMResumeParser";
import { getResumeParser } from "../src/modules/ingestion/services/ResumeParserFactory";

test("LLM parser is disabled by default and chooses the algorithm parser", () => {
  const original = process.env.USE_LLM_PARSER;
  delete process.env.USE_LLM_PARSER;

  try {
    const parser = getResumeParser();
    assert.equal(parser.constructor.name, "AlgorithmResumeParser");
  } finally {
    if (original === undefined) {
      delete process.env.USE_LLM_PARSER;
    } else {
      process.env.USE_LLM_PARSER = original;
    }
  }
});

test("LLM parser throws when it is disabled", () => {
  const original = process.env.USE_LLM_PARSER;
  delete process.env.USE_LLM_PARSER;

  try {
    const parser = new LLMResumeParser();
    assert.throws(() => parser.parseResume("Rajesh Mohan Kumar"), /LLM resume parser is disabled/i);
  } finally {
    if (original === undefined) {
      delete process.env.USE_LLM_PARSER;
    } else {
      process.env.USE_LLM_PARSER = original;
    }
  }
});
