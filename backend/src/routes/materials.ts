// ================================================================
// DERMATHERM BACKEND — Materials API Routes
// ================================================================

import express from "express";
import { z } from "zod";
import {
  createMaterial,
  getMaterial,
  getAllMaterials,
  updateMaterial,
  deleteMaterial,
} from "../db.js";

const router = express.Router();

// Validation schema
const ParameterEvidenceSchema = z.object({
  value: z.union([z.number(), z.tuple([z.number(), z.number()])]),
  unit: z.string(),
  status: z.enum(["LITERATURE-SUPPORTED", "ASSUMED / DEMONSTRATION", "NOT VERIFIED"]),
  source: z.string().optional(),
  doi: z.string().optional(),
  experimental_conditions: z.string().optional(),
  quote: z.string().optional(),
  confidence: z.enum(["MEASURED", "REPORTED", "DERIVED", "ASSUMED"]).optional(),
  notes: z.string().optional(),
});

const MaterialSchema = z.object({
  name: z.string().min(1),
  category: z.string().min(1),
  parameters: z.object({
    k: ParameterEvidenceSchema,
    D_eff: ParameterEvidenceSchema,
    thickness: ParameterEvidenceSchema,
    rho: ParameterEvidenceSchema,
    cp: ParameterEvidenceSchema,
  }),
});

// ================================================================
// GET /api/materials — List all materials
// ================================================================

router.get("/", (req, res) => {
  try {
    const materials = getAllMaterials();
    res.json({ materials });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ================================================================
// GET /api/materials/:id — Get material by ID
// ================================================================

router.get("/:id", (req, res) => {
  try {
    const material = getMaterial(req.params.id);
    
    if (!material) {
      return res.status(404).json({ error: "Material not found" });
    }
    
    res.json({ material });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ================================================================
// POST /api/materials — Create new material
// ================================================================

router.post("/", (req, res) => {
  try {
    const validation = MaterialSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({ 
        error: "Validation failed",
        details: validation.error.errors,
      });
    }
    
    const material = createMaterial(validation.data);
    res.status(201).json({ material });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ================================================================
// PUT /api/materials/:id — Update material
// ================================================================

router.put("/:id", (req, res) => {
  try {
    const validation = MaterialSchema.partial().safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: validation.error.errors,
      });
    }
    
    const material = updateMaterial(req.params.id, validation.data);
    
    if (!material) {
      return res.status(404).json({ error: "Material not found" });
    }
    
    res.json({ material });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ================================================================
// DELETE /api/materials/:id — Delete material
// ================================================================

router.delete("/:id", (req, res) => {
  try {
    const success = deleteMaterial(req.params.id);
    
    if (!success) {
      return res.status(404).json({ error: "Material not found" });
    }
    
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export { router as materialsRouter };
