export interface EmbeddingResult {
  embedding: number[];
  model: string;
  dimension: number;
}

export class EmbeddingService {
  private readonly apiKey: string | undefined;
  private readonly baseUrl: string;
  private readonly model: string;
  private readonly dimension: number;

  constructor() {
    this.apiKey = process.env.MISTRAL_API_KEY;
    this.baseUrl = "https://api.mistral.ai/v1/embeddings";
    this.model = process.env.MISTRAL_EMBED_MODEL ?? "mistral-embed";
    this.dimension = Number(process.env.EMBEDDING_DIMENSION ?? 1024);
  }

  async generateEmbedding(inputText: string): Promise<EmbeddingResult> {
    if (!this.apiKey) {
      throw new Error("MISTRAL_API_KEY is not configured");
    }

    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        input: inputText,
      }),
    });

    if (!response.ok) {
      throw new Error(`Embedding request failed with status ${response.status}`);
    }

    const data = (await response.json()) as { data?: Array<{ embedding?: number[] }> };
    const embedding = data.data?.[0]?.embedding ?? [];

    if (!Array.isArray(embedding) || embedding.length === 0) {
      throw new Error("Embedding response did not contain a valid vector");
    }

    return {
      embedding,
      model: this.model,
      dimension: embedding.length || this.dimension,
    };
  }
}
