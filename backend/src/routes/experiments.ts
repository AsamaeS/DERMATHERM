// ================================================================
// DERMATHERM BACKEND — Experiments API Routes
// ================================================================

import express from "express";
import { z } from "zod";
import {
  createExperiment,
  getExperiment,
  getAllExperiments,
  updateExperimentStatus,
  saveExperimentResults,
} from "../db.js";

const router = express.Router();

// Validation schemas
const ClimateSchema = z.object({
  T_inf: z.number(),
  RH_inf: z.number().min(0).max(100),
  v_air: z.number().min(0),
  sweat_rate: z.number().min(0),
  T_skin: z.number(),
});

const ParametersSchema = z.object({
  k: z.number().positive(),
  D_eff: z.number().positive(),
  thickness: z.number().positive(),
  rho: z.number().positive(),
  cp: z.number().positive(),
});

const SolverSchema = z.object({
  type: z.literal("FTCS_2D"),
  grid: z.object({
    nx: z.number().int().positive(),
    ny: z.number().int().positive(),
  }),
  dt_method: z.literal("CFL_limited"),
  version: z.string(),
});

const ExperimentSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  climate: ClimateSchema,
  material_id: z.string(),
  parameters: ParametersSchema,
  scenario: z.enum(["homo", "weave", "pores", "seam"]),
  hotspot: z.boolean(),
  solver: SolverSchema,
  limitations: z.array(z.string()),
  assumptions: z.array(z.string()),
  research_question: z.string().optional(),
});

const ResultsSchema = z.object({
  fields: z.object({
    T: z.array(z.array(z.number())).optional(),
    C_v: z.array(z.array(z.number())).optional(),
  }).optional(),
  metrics: z.object({
    tSim: z.number(),
    dt: z.number(),
    steps: z.number(),
    evapGm2h: z.number(),
    latentWm2: z.number(),
    TsurfMin: z.number(),
    TsurfMax: z.number(),
    cSurfMean: z.number(),
    massErrRel: z.number(),
    steady: z.boolean(),
  }),
  conservation_check: z.object({
    mass_balance_error: z.number(),
    passed: z.boolean(),
  }),
  timestamp: z.string(),
});

// ================================================================
// GET /api/experiments — List all experiments
// ================================================================

router.get("/", (req, res) => {
  try {
    const experiments = getAllExperiments();
    res.json({ experiments });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ================================================================
// GET /api/experiments/:id — Get experiment by ID
// ================================================================

router.get("/:id", (req, res) => {
  try {
    const experiment = getExperiment(req.params.id);
    
    if (!experiment) {
      return res.status(404).json({ error: "Experiment not found" });
    }
    
    res.json({ experiment });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ================================================================
// POST /api/experiments — Create new experiment
// ================================================================

router.post("/", (req, res) => {
  try {
    const validation = ExperimentSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: validation.error.errors,
      });
    }
    
    const experiment = createExperiment(validation.data);
    res.status(201).json({ experiment });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ================================================================
// PATCH /api/experiments/:id/status — Update experiment status
// ================================================================

router.patch("/:id/status", (req, res) => {
  try {
    const { status } = req.body;
    
    if (!["CONFIGURED", "RUNNING", "COMPLETED", "FAILED"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }
    
    const experiment = updateExperimentStatus(req.params.id, status);
    
    if (!experiment) {
      return res.status(404).json({ error: "Experiment not found" });
    }
    
    res.json({ experiment });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ================================================================
// POST /api/experiments/:id/results — Submit simulation results
// ================================================================

router.post("/:id/results", (req, res) => {
  try {
    const validation = ResultsSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: validation.error.errors,
      });
    }
    
    const experiment = saveExperimentResults(req.params.id, validation.data);
    
    if (!experiment) {
      return res.status(404).json({ error: "Experiment not found" });
    }
    
    res.json({ experiment });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ================================================================
// GET /api/experiments/:id/export — Export experiment
// ================================================================

router.get("/:id/export", (req, res) => {
  try {
    const experiment = getExperiment(req.params.id);
    
    if (!experiment) {
      return res.status(404).json({ error: "Experiment not found" });
    }
    
    const format = req.query.format || "json";
    
    if (format === "json") {
      res.setHeader("Content-Type", "application/json");
      res.setHeader("Content-Disposition", `attachment; filename="${experiment.id}.json"`);
      res.send(JSON.stringify(experiment, null, 2));
    } else {
      res.status(400).json({ error: "Unsupported format (only json supported currently)" });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export { router as experimentsRouter };
