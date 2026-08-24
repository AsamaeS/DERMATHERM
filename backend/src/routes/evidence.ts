// ================================================================
// DERMATHERM BACKEND — Evidence & Literature API Routes
// ================================================================

import express from "express";
import { extractEvidenceWithQwen } from "../services/qwen.js";
import { searchLiterature } from "../services/firecrawl.js";

const router = express.Router();

// ================================================================
// POST /api/evidence/extract — Extract parameter evidence using Qwen
// ================================================================

router.post("/extract", async (req, res) => {
  try {
    const { paper_text, material, parameter } = req.body;
    
    if (!paper_text || !material || !parameter) {
      return res.status(400).json({ 
        error: "Missing required fields: paper_text, material, parameter" 
      });
    }
    
    if (!process.env.FEATHERLESS_API_KEY) {
      return res.status(503).json({ 
        error: "Qwen/Featherless integration not configured" 
      });
    }
    
    const evidence = await extractEvidenceWithQwen(paper_text, material, parameter);
    res.json({ evidence });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ================================================================
// POST /api/literature/search — Search literature using Firecrawl
// ================================================================

router.post("/search", async (req, res) => {
  try {
    const { query } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: "Missing query" });
    }
    
    if (!process.env.FIRECRAWL_API_KEY) {
      return res.status(503).json({
        error: "Firecrawl integration not configured"
      });
    }
    
    const results = await searchLiterature(query);
    res.json({ results });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export { router as evidenceRouter };
