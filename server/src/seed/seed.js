// CLI entry point for seeding a persistent database (e.g. MongoDB Atlas via MONGODB_URI).
// Not used when running against the in-memory dev database — that seeds automatically
// on server startup instead, since an in-memory DB doesn't survive a separate process.
import "dotenv/config";
import { connectDB, disconnectDB } from "../config/db.js";
import { seedDatabase } from "./seedDatabase.js";

async function run() {
  await connectDB();
  await seedDatabase();
  await disconnectDB();
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
