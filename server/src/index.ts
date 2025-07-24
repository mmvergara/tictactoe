import app from "./app";
import config from "./config/config";
import { closeMongoDbConn } from "./db/mongo";

async function run() {
  console.log("Starting server...");

  app.listen(config.port, () => {
    console.log(`Server running on port ${config.port}`);
  });

  process.on("SIGINT", async () => {
    await closeMongoDbConn();
    process.exit(0);
  });
}

run();
