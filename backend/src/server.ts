// ================================================================
// DERMATHERM BACKEND — API Server
// ================================================================

import express from "express";
import cors from "cors";
import { config } from "dotenv";
import { initializeDatabase } from "./db.js";
import { materialsRouter } from "./routes/materials.js";
import { experimentsRouter } from "./routes/experiments.js";
import { evidenceRouter } from "./routes/evidence.js";
import { mlRouter } from "./routes/ml.js";
import { healthRouter } from "./routes/health.js";
import { youcamRouter } from "./routes/youcam.js";

config();

const app = express();
const PORT = parseInt(process.env.PORT || "8000", 10);

// ================================================================
// MIDDLEWARE
// ================================================================

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
}));

app.use(express.json({ limit: "50mb" })); // Allow large field data
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} ${res.statusCode} ${duration}ms`);
  });
  next();
});

// ================================================================
// ROUTES
// ================================================================

app.use("/api/health", healthRouter);
app.use("/api/materials", materialsRouter);
app.use("/api/experiments", experimentsRouter);
app.use("/api/evidence", evidenceRouter);
app.use("/api/ml", mlRouter);
app.use("/api/youcam", youcamRouter);

// ================================================================
// ERROR HANDLING
// ================================================================

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Error:", err);
  
  // Don't leak internal errors to client
  const isProduction = process.env.NODE_ENV === "production";
  
  res.status(err.status || 500).json({
    error: {
      message: isProduction ? "Internal server error" : err.message,
      ...(isProduction ? {} : { stack: err.stack }),
    },
  });
});

// ================================================================
// STARTUP
// ================================================================

async function startServer() {
  try {
    // Initialize database
    initializeDatabase();
    
    // Seed with default materials if empty
    const { getAllMaterials } = await import("./db.js");
    if (getAllMaterials().length === 0) {
      console.log("Seeding default materials...");
      const { seedDefaultMaterials } = await import("./seed.js");
      seedDefaultMaterials();
    }
    
    // Start server
    app.listen(PORT, "0.0.0.0", () => {
      console.log("=================================================");
      console.log("  DERMATHERM RESEARCH PLATFORM — Backend");
      console.log("=================================================");
      console.log(`  ✓ Server running on http://0.0.0.0:${PORT}`);
      console.log(`  ✓ Frontend: ${process.env.FRONTEND_URL || "http://localhost:5173"}`);
      console.log(`  ✓ Database: ${process.env.DATABASE_PATH || "./data/dermatherm.db"}`);
      console.log(`  ✓ Qwen: ${process.env.FEATHERLESS_API_KEY ? "Configured" : "Not configured"}`);
      console.log(`  ✓ Firecrawl: ${process.env.FIRECRAWL_API_KEY ? "Configured" : "Not configured"}`);
      console.log("=================================================\n");
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("\nSIGTERM received, shutting down gracefully...");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("\nSIGINT received, shutting down gracefully...");
  process.exit(0);
});
