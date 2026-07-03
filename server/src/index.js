import "dotenv/config";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import { seedDatabase } from "./seed/seedDatabase.js";

const port = process.env.PORT || 4000;

const { isInMemory } = await connectDB();

// The in-memory dev database starts empty every process run, so seed it automatically.
// Against a persistent database (MONGODB_URI set), run `npm run seed` explicitly instead.
if (isInMemory) {
  await seedDatabase();
}

app.listen(port, () => {
  console.log(`SkyJet flight recovery API listening on http://localhost:${port}`);
});
