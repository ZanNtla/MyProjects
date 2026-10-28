import { Router } from "express";
import { uploadResume } from "../../../config/multerConfig";
import { cleanResumeController, detectSkillsController, extractResumeController, generateEmbeddingController, getIngestionHealth, parseResumeController, storeResumeController, uploadResumeController } from "../controllers/ingestionController";

export const ingestionRoutes = Router();

ingestionRoutes.get("/resume/health", getIngestionHealth);
ingestionRoutes.post("/resume/upload", uploadResume.single("file"), uploadResumeController);
ingestionRoutes.post("/resume/extract", uploadResume.single("file"), extractResumeController);
ingestionRoutes.post("/resume/clean", cleanResumeController);
ingestionRoutes.post("/resume/skills", detectSkillsController);
ingestionRoutes.post("/resume/parse", parseResumeController);
ingestionRoutes.post("/resume/embed", generateEmbeddingController);
ingestionRoutes.post("/resume/store", storeResumeController);
