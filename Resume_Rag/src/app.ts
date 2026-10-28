import cors from "cors";
import express from "express";
import { getDatabase } from "./config/database";
import { errorHandler } from "./middleware/errorHandler";
import { logger } from "./middleware/logger";
import { requestId } from "./middleware/requestId";
import { ingestionRoutes } from "./modules/ingestion/routes/ingestionRoutes";

const startedAt = Date.now();

export const app = express();

app.use(cors());
app.use(express.json());
app.use(requestId);
app.use(logger);
app.use("/v1", ingestionRoutes);

app.get("/v1/health", (_request, response) => {
  response.status(200).json({
    status: "ok",
    app: "resume-rag-backend",
    version: "1.0.0",
    uptime: Number(((Date.now() - startedAt) / 1000).toFixed(1)),
  });
});

app.get("/v1/health/db", async (_request, response) => {
  const startedAt = Date.now();

  try {
    const database = await getDatabase();
    await database.command({ ping: 1 });
    await database.collection("resumes").findOne({}, { projection: { _id: 1 } });

    response.status(200).json({
      status: "ok",
      database: "mongodb",
      connected: true,
      latencyMs: Date.now() - startedAt,
    });
  } catch (_error) {
    response.status(503).json({
      status: "error",
      database: "mongodb",
      connected: false,
      errorCode: "DB_CONNECTION_FAILED",
    });
  }
});

app.use((_request, response) => {
  response.status(404).json({
    success: false,
    errorCode: "NOT_FOUND",
    message: "Route not found",
  });
});

app.use(errorHandler);
