import express from "express";
import { createServer } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mongoose from "mongoose";
import cors from "cors";
import { connectToSocket } from "./controllers/socketManager.js";
import userRoutes from "./routes/users.routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env safely using Node's built-in env loader
try {
  process.loadEnvFile(path.resolve(__dirname, "../.env"));
} catch (e) {
  try {
    process.loadEnvFile();
  } catch (err) {
    // Environment variables may be set by the host environment
  }
}

const app = express();
const server = createServer(app);
const io = connectToSocket(server);

const PORT = process.env.PORT || 8000;
app.set("port", PORT);
app.use(cors());
app.use(express.json({ limit: "40kb" }));
app.use(express.urlencoded({ limit: "40kb", extended: true }));

app.use("/api/v1/users", userRoutes);

const start = async () => {
  const rawMongoUri = process.env.MONGO_URI;
  if (!rawMongoUri) {
    console.error("Error: MONGO_URI is not set in environment or .env file!");
    process.exit(1);
  }

  // Strip placeholder angle brackets if accidentally present, e.g. <username>
  const mongoUri = rawMongoUri.replace(/<([^>]+)>/g, "$1");

  const connectionDb = await mongoose.connect(mongoUri);
  console.log(`MONGO Connected DB Host: ${connectionDb.connection.host}`);

  server.listen(PORT, () => {
    console.log(`Server running on port :${PORT}`);
  });
};

start();
