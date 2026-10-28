import test from 'node:test';
import assert from 'node:assert/strict';
import { cleanResumeText } from '../src/modules/ingestion/utils/textCleaner.ts';

test('cleanResumeText removes extra whitespace while preserving technical terms', () => {
  const input = '  Rajesh Mohan Kumar\n\n\nTest Architect & Senior Agentic Test Engineer   \n   RAG\n\nC#    .NET\n\n';

  const result = cleanResumeText(input);

  assert.equal(result, 'Rajesh Mohan Kumar\nTest Architect & Senior Agentic Test Engineer\nRAG\nC# .NET');
});

const { extractExperienceYears } = await import('../src/modules/ingestion/utils/regex.ts');

test('extractExperienceYears extracts years from text', () => {
  assert.equal(extractExperienceYears('13+ years of experience'), 13);
});
