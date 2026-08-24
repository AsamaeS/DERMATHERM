// ================================================================
// DERMATHERM BACKEND — Health Check Route
// ================================================================

import express from "express";
import { db } from "../db.js";

const router = express.Router();

router.get("/", (req, res) => {
  try {
    // Test database connection
    db.prepare("SELECT 1").get();
    
    res.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      services: {
        database: "operational",
        qwen: process.env.FEATHERLESS_API_KEY ? "configured" : "not configured",
        firecrawl: process.env.FIRECRAWL_API_KEY ? "configured" : "not configured",
        wolfram: process.env.WOLFRAM_APP_ID ? "configured" : "not configured",
      },
      version: "1.0.0",
    });
  } catch (error: any) {
    res.status(503).json({
      status: "unhealthy",
      error: error.message,
    });
  }
});

export { router as healthRouter };
