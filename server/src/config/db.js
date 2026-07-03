import mongoose from "mongoose";

let memoryServer = null;

export async function connectDB() {
  let uri = process.env.MONGODB_URI;

  if (!uri) {
    const { MongoMemoryServer } = await import("mongodb-memory-server");
    memoryServer = await MongoMemoryServer.create();
    uri = memoryServer.getUri("skyjet");
    console.log("No MONGODB_URI set — started in-memory MongoDB for this session.");
  }

  await mongoose.connect(uri);
  console.log(`MongoDB connected (${memoryServer ? "in-memory" : "external"})`);
  return { isInMemory: Boolean(memoryServer) };
}

export async function disconnectDB() {
  await mongoose.disconnect();
  if (memoryServer) await memoryServer.stop();
}
