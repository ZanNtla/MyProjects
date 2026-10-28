import fs from "node:fs/promises";
import { Request, Response } from "express";
import { getDatabase } from "../../../config/database";
import { detectSkills } from "../../../config/skills";
import { ResumeIngestionRepository } from "../repositories/ResumeIngestionRepository";
import { AlgorithmResumeParser } from "../services/AlgorithmResumeParser";
import { EmbeddingService } from "../services/EmbeddingService";
import { getResumeParser } from "../services/ResumeParserFactory";
import { ResumeParserService } from "../services/ResumeParserService";
import { cleanResumeText } from "../utils/textCleaner";

const resumeParserService = new ResumeParserService();
const algorithmResumeParser = new AlgorithmResumeParser();
const embeddingService = new EmbeddingService();

export function getIngestionHealth(_request: Request, response: Response): void {
  response.status(200).json({
    status: "ok",
    module: "resume-ingestion",
  });
}

export function uploadResumeController(request: Request, response: Response): void {
  if (!request.file) {
    response.status(400).json({
      success: false,
      errorCode: "MISSING_FILE",
      message: "A PDF file is required in the file field",
    });
    return;
  }

  response.status(201).json({
    success: true,
    message: "Resume uploaded successfully",
    file: {
      originalName: request.file.originalname,
      mimeType: request.file.mimetype,
      size: request.file.size,
    },
  });
}

export async function extractResumeController(request: Request, response: Response): Promise<void> {
  if (!request.file) {
    response.status(400).json({
      success: false,
      errorCode: "MISSING_FILE",
      message: "A PDF file is required in the file field",
    });
    return;
  }

  const filePath = request.file.path;

  try {
    const rawText = await resumeParserService.extractTextFromPdf(filePath);
    const normalizedText = rawText.replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();

    response.status(200).json({
      success: true,
      rawText: normalizedText,
      characters: normalizedText.length,
    });
  } catch (_error) {
    response.status(422).json({
      success: false,
      errorCode: "RESUME_EXTRACTION_FAILED",
      message: "Resume extraction failed",
    });
  } finally {
    await fs.unlink(filePath).catch(() => undefined);
  }
}

export function cleanResumeController(request: Request, response: Response): void {
  const rawText = typeof request.body?.rawText === "string" ? request.body.rawText : "";

  if (!rawText || rawText.trim().length === 0) {
    response.status(400).json({
      success: false,
      errorCode: "INVALID_RAW_TEXT",
      message: "rawText is required",
    });
    return;
  }

  const cleanText = cleanResumeText(rawText);

  response.status(200).json({
    success: true,
    cleanText,
  });
}

export function detectSkillsController(request: Request, response: Response): void {
  const rawText = typeof request.body?.rawText === "string" ? request.body.rawText : "";

  if (!rawText || rawText.trim().length === 0) {
    response.status(400).json({
      success: false,
      errorCode: "INVALID_RAW_TEXT",
      message: "rawText is required",
    });
    return;
  }

  const skills = detectSkills(rawText);

  response.status(200).json({
    success: true,
    skills,
  });
}

export function parseResumeController(request: Request, response: Response): void {
  const rawText = typeof request.body?.rawText === "string" ? request.body.rawText : "";

  if (!rawText || rawText.trim().length === 0) {
    response.status(400).json({
      success: false,
      errorCode: "INVALID_RAW_TEXT",
      message: "rawText is required",
    });
    return;
  }

  try {
    const parser = getResumeParser();
    const resume = parser.parseResume(rawText);

    response.status(200).json({
      success: true,
      resume,
    });
  } catch (_error) {
    response.status(400).json({
      success: false,
      errorCode: "LLM_PARSER_DISABLED",
      message: "LLM resume parser is disabled",
    });
  }
}

export async function generateEmbeddingController(request: Request, response: Response): Promise<void> {
  const { name, role, skills, company, rawText } = request.body ?? {};

  const values = [name, role, Array.isArray(skills) ? skills.join(", ") : "", company, rawText].filter((value) => value !== undefined && value !== null && String(value).trim().length > 0);

  if (values.length === 0) {
    response.status(400).json({
      success: false,
      errorCode: "INVALID_EMBEDDING_INPUT",
      message: "A valid resume payload is required",
    });
    return;
  }

  try {
    const embeddingText = [
      String(name ?? ""),
      String(role ?? ""),
      Array.isArray(skills) ? skills.join(", ") : "",
      String(company ?? ""),
      String(rawText ?? ""),
    ].filter(Boolean).join("\n");

    const result = await embeddingService.generateEmbedding(embeddingText);

    response.status(200).json({
      success: true,
      model: result.model,
      dimension: result.dimension,
      embedding: result.embedding,
    });
  } catch (error: unknown) {
    response.status(500).json({
      success: false,
      errorCode: "EMBEDDING_FAILED",
      message: error instanceof Error ? error.message : "Embedding generation failed",
    });
  }
}

export async function storeResumeController(request: Request, response: Response): Promise<void> {
  const { fileName, resume, rawText, embedding } = request.body ?? {};

  if (!fileName || !resume || typeof rawText !== "string" || !Array.isArray(embedding)) {
    response.status(400).json({
      success: false,
      errorCode: "INVALID_STORE_PAYLOAD",
      message: "fileName, resume, rawText, and embedding are required",
    });
    return;
  }

  try {
    const repository = (request.app?.locals?.resumeRepository as ResumeIngestionRepository | undefined)
      ?? new ResumeIngestionRepository(await getDatabase());

    const result = await repository.insertResume({
      fileName,
      rawText,
      name: resume.name,
      email: resume.email ?? null,
      phone: resume.phone ?? null,
      location: resume.location ?? null,
      company: resume.company,
      role: resume.role,
      education: resume.education,
      totalExperience: resume.totalExperience ?? null,
      relevantExperience: resume.relevantExperience ?? null,
      skills: Array.isArray(resume.skills) ? resume.skills : [],
      jobTitles: Array.isArray(resume.jobTitles) ? resume.jobTitles : [],
      experienceSummary: resume.experienceSummary,
      embedding,
      embeddingModel: "mistral-embed",
      embeddingDimension: embedding.length,
    });

    response.status(200).json({
      success: true,
      message: "Resume stored successfully",
      insertedId: result.insertedId,
    });
  } catch (error: unknown) {
    response.status(500).json({
      success: false,
      errorCode: "RESUME_STORE_FAILED",
      message: error instanceof Error ? error.message : "Resume could not be stored",
    });
  }
}
