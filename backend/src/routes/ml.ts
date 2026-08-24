// ================================================================
// DERMATHERM BACKEND — ML/PINN API Routes
// ================================================================

import express from "express";
import { getAllMLModels, getMLModel, saveMLModel } from "../db.js";
import { z } from "zod";

const router = express.Router();

const MLModelSchema = z.object({
  name: z.string().min(1),
  type: z.enum(["PINN", "DATA_ONLY"]),
  architecture: z.object({
    layers: z.array(z.number().int().positive()),
    activation: z.string(),
  }),
  training_config: z.object({
    n_data: z.number().int().positive(),
    n_collocation: z.number().int().positive(),
    epochs: z.number().int().positive(),
    lr: z.number().positive(),
  }),
  trained_on: z.array(z.string()),
  metrics: z.object({
    rmse: z.number(),
    relL2: z.number(),
    resNorm: z.number().optional(),
  }),
});

// ================================================================
// GET /api/ml/models — List all ML models
// ================================================================

router.get("/models", (req, res) => {
  try {
    const models = getAllMLModels();
    res.json({ models });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ================================================================
// GET /api/ml/models/:id — Get ML model by ID
// ================================================================

router.get("/models/:id", (req, res) => {
  try {
    const model = getMLModel(req.params.id);
    
    if (!model) {
      return res.status(404).json({ error: "Model not found" });
    }
    
    res.json({ model });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ================================================================
// POST /api/ml/models — Save ML model metadata
// ================================================================

router.post("/models", (req, res) => {
  try {
    const validation = MLModelSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: validation.error.errors,
      });
    }
    
    const model = saveMLModel(validation.data);
    res.status(201).json({ model });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ================================================================
// POST /api/ml/train — Trigger PINN training
// NOTE: Training happens in browser currently
// ================================================================

router.post("/train", (req, res) => {
  try {
    // For now, training happens client-side
    // This endpoint can be used to trigger server-side training later
    res.json({ 
      message: "Training currently runs in browser. Use this endpoint for future server-side training.",
      status: "not_implemented",
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ================================================================
// POST /api/ml/compare — Generate comparison report
// ================================================================

router.post("/compare", (req, res) => {
  try {
    const { solver_experiment_id, data_only_model_id, pinn_model_id } = req.body;
    
    if (!solver_experiment_id || !data_only_model_id || !pinn_model_id) {
      return res.status(400).json({
        error: "Missing required IDs",
      });
    }
    
    // Comparison logic would go here
    // For now, return placeholder
    res.json({
      message: "Comparison generation not yet implemented",
      status: "not_implemented",
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export { router as mlRouter };
