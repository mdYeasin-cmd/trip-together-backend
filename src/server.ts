import { Server } from "http";
import app from "./app";
import config from "./app/config";
import { db } from "./prisma/db";

let server: Server;

async function main() {
  try {
    await db.execute(db.raw.sql`SELECT 1`.affectedCount().build());
    console.log("Database connected successfully!");
  } catch (error) {
    console.error("Database connection failed!", error);
    process.exit(1);
  }

  server = app.listen(config.port, () => {
    console.log(
      `Trip Together server is running at http://localhost:${config.port}`,
    );
  });
}

main();
