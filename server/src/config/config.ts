import dotenv from "dotenv";
import process from "process";

dotenv.config();

interface Config {
  port: number;
  nodeEnv: string;
  mongoURI: string;
  dbName: string;
}

const config: Config = {
  port: Number(process.env.PORT) || 8080,
  nodeEnv: process.env.NODE_ENV || "development",
  mongoURI: process.env.MONGO_URI!,
  dbName: process.env.DB_NAME || "tictacnext",
};

export default config;
