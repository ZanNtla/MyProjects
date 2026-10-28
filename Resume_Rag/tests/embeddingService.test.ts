import test from "node:test";
import assert from "node:assert/strict";
import { EmbeddingService } from "../src/modules/ingestion/services/EmbeddingService";

test("EmbeddingService generates a numeric embedding from resume text", async () => {
  const originalFetch = global.fetch;
  const originalApiKey = process.env.MISTRAL_API_KEY;

  process.env.MISTRAL_API_KEY = "test-key";

  global.fetch = async () => ({
    ok: true,
    status: 200,
    json: async () => ({
      data: [{ embedding: [0.1, -0.2, 0.3, 0.4] }],
    }),
  }) as typeof fetch;

  try {
    const service = new EmbeddingService();
    const result = await service.generateEmbedding("Rajesh Mohan Kumar");

    assert.deepEqual(result.embedding, [0.1, -0.2, 0.3, 0.4]);
    assert.equal(result.model, "mistral-embed");
    assert.equal(result.dimension, 4);
  } finally {
    global.fetch = originalFetch;
    if (originalApiKey === undefined) {
      delete process.env.MISTRAL_API_KEY;
    } else {
      process.env.MISTRAL_API_KEY = originalApiKey;
    }
  }
});
