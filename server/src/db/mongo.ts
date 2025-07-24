import { Collection, Db, MongoClient } from "mongodb";
import config from "../config/config";
import { GameSessionDoc } from "../repository/game-repository";

let db: Db | null = null;
let mongoClient: MongoClient | null = null;

export const getCurrentTimestamp = (): string => new Date().toISOString();

// Connect to MongoDB
export const connectToMongoDB = async () => {
  console.log("Connecting to MongoDB...");
  try {
    mongoClient = new MongoClient(config.mongoURI);
    await mongoClient.connect();
    console.log("Connected to MongoDB successfully");
    db = mongoClient.db(config.dbName);
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

export const getDatabase = () => {
  if (!db) {
    throw new Error("Database not initialized. Call connectToMongoDB first.");
  }
  return db;
};

export const closeMongoDbConn = async () => {
  if (mongoClient) {
    try {
      await mongoClient.close();
      console.log("MongoDB connection closed");
    } catch (error) {
      console.error("Error closing MongoDB connection:", error);
    } finally {
      mongoClient = null;
      db = null; // Reset db and mongoClient to null after closing.
    }
  }
};
let gameSessionsCollection: Collection<GameSessionDoc> | null = null;
export const getGameSessionsCollection = () => {
  if (!gameSessionsCollection) {
    const database = getDatabase();
    gameSessionsCollection =
      database.collection<GameSessionDoc>("gameSessions");
  }
  return gameSessionsCollection;
};
