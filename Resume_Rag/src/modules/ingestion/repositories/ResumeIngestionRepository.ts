import { Db } from "mongodb";

export interface ResumeRecord {
  fileName?: string;
  rawText?: string;
  name?: string;
  email?: string | null;
  phone?: string | null;
  location?: string | null;
  company?: string;
  role?: string;
  education?: string;
  totalExperience?: number | null;
  relevantExperience?: number | null;
  skills?: string[];
  jobTitles?: string[];
  experienceSummary?: string;
  embedding?: number[];
  embeddingModel?: string;
  embeddingDimension?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export class ResumeIngestionRepository {
  constructor(private readonly database: Db) {}

  async insertResume(record: ResumeRecord): Promise<{ acknowledged: boolean; insertedId?: unknown }> {
    const result = await this.database.collection("resumes").insertOne({
      ...record,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return {
      acknowledged: result.acknowledged,
      insertedId: result.insertedId,
    };
  }
}
