import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/database.js";
import progressRoutes from "./routes/progress.routes.js";
import authRoutes from "./routes/auth.js";
import aiRoutes from "./routes/ai.js";
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

const app = express();

// ✅ Trust proxy (important for Nginx)
app.set("trust proxy", 1);

// ✅ Middleware - Parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ CRITICAL: Serve static files from uploads directory
// This must come BEFORE other routes
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
console.log('📁 Static files served from:', path.join(__dirname, 'uploads'));

// ✅ CORS Configuration - Simplified for Nginx proxy
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "X-Forwarded-For",
      "X-Real-IP",
    ],
    exposedHeaders: ["Content-Range", "X-Content-Range"],
  })
);

// ✅ Handle preflight requests
app.options(/.*/, cors());

// ✅ Connect to MongoDB Atlas
connectDB();

// ✅ API Routes
app.use("/api/progress", progressRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/ai", aiRoutes);

// ✅ Health check route
app.get("/", (req, res) => {
  res.json({
    status: "running",
    message: "VirtueSense Node API is running 🚀",
    timestamp: new Date().toISOString(),
    database: "MongoDB Atlas - VirtueSense",
  });
});

app.get("/api", (req, res) => {
  res.json({
    status: "ok",
    message: "API is working",
    endpoints: {
      auth: "/api/auth",
      progress: "/api/progress/my",
      complete: "/api/progress/complete",
      ai: "/api/ai/evaluate-answer",
    },
  });
});

// ✅ 404 handler
app.use((req, res) => {
  console.log(`⚠️  404: ${req.method} ${req.url}`);
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.url} not found`,
  });
});

// ✅ Error handler
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.message);
  console.error("Stack:", err.stack);
  res.status(500).json({
    success: false,
    error: err.message,
  });
});

// ✅ Start Server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log("");
  console.log("═══════════════════════════════════════════════════");
  console.log("  VirtueSense Node.js API Server");
  console.log("═══════════════════════════════════════════════════");
  console.log(`✅ Server running on: http://localhost:${PORT}`);
  console.log(`✅ Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`✅ CORS: Enabled for Nginx proxy`);
  console.log(`✅ Database: MongoDB Atlas`);
  console.log("═══════════════════════════════════════════════════");
  console.log("");
});

// ✅ Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n🛑 Shutting down gracefully...");
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("\n🛑 Shutting down gracefully...");
  process.exit(0);
});