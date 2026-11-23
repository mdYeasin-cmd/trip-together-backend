import { Server } from "http";
import app from "./app";
import config from "./app/config";
import { db } from "./prisma/db";

const isVercel = Boolean(process.env.VERCEL);

let server: Server;

async function main() {
  try {
    await db.execute(db.raw.sql`SELECT 1`.affectedCount().build());
    console.log("Database connected successfully!");
  } catch (error) {
    console.error("Database connection failed!", error);
    // On Vercel, exiting kills the function and every request returns 500.
    if (!isVercel) process.exit(1);
  }

  // Vercel invokes the exported app as a handler; only listen when self-hosted.
  if (!isVercel) {
    server = app.listen(config.port, () => {
      console.log(
        `Trip Together server is running at http://localhost:${config.port}`,
      );
    });
  }
}

main();

export default app;
