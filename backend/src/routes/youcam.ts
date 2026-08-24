// ================================================================
// DERMATHERM BACKEND — YouCam API Routes
// Skin observation and image analysis endpoints
// ================================================================

import express from "express";
import { z } from "zod";
import {
  analyzeSkinImage,
  associateObservationWithExperiment,
  checkYouCamStatus,
  getSupportedFeatures,
  validateImageForAnalysis,
  type ExperimentContext,
} from "../services/youcam.js";

const router = express.Router();

// Validation schemas
const AnalyzeImageSchema = z.object({
  image: z.string().min(100), // Base64 encoded image
  analysis_type: z.enum(["observation", "texture"]).optional(),
});

const AssociateWithExperimentSchema = z.object({
  observation_id: z.string(),
  experiment_id: z.string(),
  climate_conditions: z.object({
    T_inf: z.number(),
    RH_inf: z.number(),
    duration_minutes: z.number(),
  }),
  material_used: z.string().optional(),
});

// ================================================================
// GET /api/youcam/status — Check YouCam service status
// ================================================================

router.get("/status", async (req, res) => {
  try {
    const status = await checkYouCamStatus();
    res.json(status);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ================================================================
// GET /api/youcam/features — Get supported analysis features
// ================================================================

router.get("/features", (req, res) => {
  try {
    const features = getSupportedFeatures();
    res.json({ features });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ================================================================
// POST /api/youcam/analyze — Analyze skin image
// ================================================================

router.post("/analyze", async (req, res) => {
  try {
    // Validate request body
    const validation = AnalyzeImageSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: validation.error.errors,
      });
    }

    const { image, analysis_type } = validation.data;

    // Validate image
    const imageValidation = validateImageForAnalysis(image);
    if (!imageValidation.valid) {
      return res.status(400).json({
        error: imageValidation.error,
      });
    }

    // Check if YouCam is configured
    if (!process.env.YOUCAM_API_KEY) {
      return res.status(503).json({
        error: "YouCam integration not configured",
        message:
          "YOUCAM_API_KEY environment variable is not set. The skin observation module is optional and the rest of the application works without it.",
      });
    }

    // Analyze image
    const observation = await analyzeSkinImage(image, analysis_type);

    res.json({
      observation,
      disclaimer: observation.disclaimer,
    });
  } catch (error: any) {
    console.error("YouCam analysis error:", error);
    res.status(500).json({ error: error.message });
  }
});

// ================================================================
// POST /api/youcam/associate — Associate observation with experiment
// ================================================================

router.post("/associate", async (req, res) => {
  try {
    const validation = AssociateWithExperimentSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: validation.error.errors,
      });
    }

    const { observation_id, experiment_id, climate_conditions, material_used } =
      validation.data;

    // In a real implementation, you would:
    // 1. Fetch the observation from database
    // 2. Verify the experiment exists
    // 3. Create the association

    // For now, we'll create a mock response
    const experimentContext: ExperimentContext = {
      experiment_id,
      climate_conditions,
      material_used,
    };

    // Note: This would typically retrieve the actual observation from DB
    const mockObservation = {
      observation_id,
      timestamp: new Date().toISOString(),
      image_metadata: { width: 0, height: 0, format: "unknown" },
      observations: {},
      notes: "Retrieved from database",
      disclaimer: "See full disclaimer",
    };

    const associatedObservation = associateObservationWithExperiment(
      mockObservation as any,
      experimentContext
    );

    res.json(associatedObservation);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ================================================================
// GET /api/youcam/disclaimer — Get full disclaimer text
// ================================================================

router.get("/disclaimer", (req, res) => {
  res.json({
    disclaimer: `
SKIN OBSERVATION DISCLAIMER:

This analysis provides DESCRIPTIVE image observations only. It does NOT:
- Diagnose medical conditions
- Predict disease
- Recommend treatments
- Establish causality with environmental conditions
- Replace medical examination
- Validate computational models

Observations are:
- Image-based descriptive data
- Subject to imaging conditions
- Not medical assessments
- Not predictive of health outcomes

Any association with simulation experiments is for RECORD-KEEPING ONLY.
No causal inference is implied or supported.

SEPARATION OF CONCERNS:
1. IMAGE OBSERVATION (YouCam) — Descriptive image analysis
2. PHYSICS SIMULATION (Dermatherm) — Computational modeling
3. MEDICAL INTERPRETATION — OUT OF SCOPE (consult healthcare professional)

These three domains are SEPARATE and must not be confused.

For medical concerns, consult a qualified healthcare professional.
    `.trim(),
  });
});

export { router as youcamRouter };
