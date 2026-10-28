import dotenv from "dotenv";
import { Db, MongoClient } from "mongodb";

dotenv.config();

export const databaseConfig = {
  uri: process.env.MONGODB_URI,
  name: process.env.MONGODB_DB_NAME ?? "resume_rag",
};

let clientPromise: Promise<MongoClient> | undefined;

export function getDatabase(): Promise<Db> {
  if (!databaseConfig.uri) {
    return Promise.reject(new Error("MONGODB_URI is not configured"));
  }

  if (!clientPromise) {
    const client = new MongoClient(databaseConfig.uri);
    clientPromise = client.connect().catch((error: unknown) => {
      clientPromise = undefined;
      throw error;
    });
  }

  return clientPromise.then((client) => client.db(databaseConfig.name));
}
