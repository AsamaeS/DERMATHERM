// ================================================================
// DERMATHERM BACKEND — YouCam (Perfect Corp) Integration
// Skin observation and image analysis service
// ================================================================

import axios from "axios";

const YOUCAM_API_KEY = process.env.YOUCAM_API_KEY;
const YOUCAM_BASE_URL = "https://api.perfectcorp.com/v1"; // Adjust based on actual API

export interface SkinObservation {
  observation_id: string;
  timestamp: string;
  image_metadata: {
    width: number;
    height: number;
    format: string;
  };
  observations: {
    skin_tone?: {
      value: string;
      confidence: number;
    };
    moisture_level?: {
      value: string; // e.g., "dry", "normal", "oily"
      confidence: number;
    };
    texture_analysis?: {
      smoothness: number;
      roughness: number;
      confidence: number;
    };
    temperature_zones?: {
      areas: Array<{
        region: string;
        relative_temperature: string; // "warmer", "cooler", "neutral"
        confidence: number;
      }>;
    };
  };
  notes: string;
  disclaimer: string;
}

/**
 * CRITICAL BOUNDARIES:
 * 
 * YouCam provides IMAGE OBSERVATIONS, NOT:
 * - Medical diagnoses
 * - Disease predictions
 * - Treatment recommendations
 * - Clinical causality
 * 
 * Observations are DESCRIPTIVE ONLY and must be clearly separated from:
 * - Physics simulation results
 * - Medical interpretation
 * - Health recommendations
 */
export async function analyzeSkinImage(
  imageBase64: string,
  analysisType: "observation" | "texture" = "observation"
): Promise<SkinObservation> {
  try {
    if (!YOUCAM_API_KEY) {
      throw new Error("YOUCAM_API_KEY not configured");
    }

    // Example API call structure (adjust based on actual YouCam API documentation)
    const response = await axios.post(
      `${YOUCAM_BASE_URL}/skin/analyze`,
      {
        image: imageBase64,
        analysis_type: analysisType,
        features: [
          "skin_tone",
          "moisture_level",
          "texture",
          "temperature_zones",
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${YOUCAM_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 30000,
      }
    );

    const data = response.data;

    // Map API response to our schema
    const observation: SkinObservation = {
      observation_id: data.id || generateObservationId(),
      timestamp: new Date().toISOString(),
      image_metadata: {
        width: data.image_width || 0,
        height: data.image_height || 0,
        format: data.image_format || "unknown",
      },
      observations: {
        skin_tone: data.skin_tone
          ? {
              value: data.skin_tone.value,
              confidence: data.skin_tone.confidence,
            }
          : undefined,
        moisture_level: data.moisture
          ? {
              value: data.moisture.level,
              confidence: data.moisture.confidence,
            }
          : undefined,
        texture_analysis: data.texture
          ? {
              smoothness: data.texture.smoothness,
              roughness: data.texture.roughness,
              confidence: data.texture.confidence,
            }
          : undefined,
        temperature_zones: data.temperature_zones
          ? {
              areas: data.temperature_zones.map((zone: any) => ({
                region: zone.region,
                relative_temperature: zone.relative_temp,
                confidence: zone.confidence,
              })),
            }
          : undefined,
      },
      notes: buildObservationNotes(data),
      disclaimer: DISCLAIMER_TEXT,
    };

    return observation;
  } catch (error: any) {
    console.error("YouCam analysis error:", error);

    if (error.response) {
      throw new Error(`YouCam API error: ${error.response.status} - ${error.response.data?.message || "Unknown error"}`);
    }

    throw new Error(`Failed to analyze image: ${error.message}`);
  }
}

/**
 * Associate a skin observation with an experiment context
 * This creates a link but NEVER implies causality
 */
export interface ExperimentContext {
  experiment_id: string;
  climate_conditions: {
    T_inf: number;
    RH_inf: number;
    duration_minutes: number;
  };
  material_used?: string;
}

export interface ObservationWithContext {
  observation: SkinObservation;
  experiment_context?: ExperimentContext;
  relationship_note: string;
}

export function associateObservationWithExperiment(
  observation: SkinObservation,
  experimentContext: ExperimentContext
): ObservationWithContext {
  return {
    observation,
    experiment_context: experimentContext,
    relationship_note: `This skin observation was recorded in the context of experiment ${experimentContext.experiment_id}. 
    
CRITICAL: This association is for RECORD-KEEPING ONLY. It does NOT establish:
- Causal relationships between simulation and skin state
- Medical interpretations of observed features
- Predictions about skin health outcomes
- Validation of the computational model against human skin

The observation is a DESCRIPTIVE snapshot. The experiment is a COMPUTATIONAL simulation. 
They exist in separate domains.`,
  };
}

function generateObservationId(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `OBS-${timestamp}-${random}`;
}

function buildObservationNotes(data: any): string {
  const notes: string[] = [];

  if (data.skin_tone) {
    notes.push(`Skin tone observed: ${data.skin_tone.value}`);
  }

  if (data.moisture) {
    notes.push(`Moisture level: ${data.moisture.level}`);
  }

  if (data.texture) {
    notes.push(
      `Texture analysis: smoothness ${data.texture.smoothness.toFixed(2)}, roughness ${data.texture.roughness.toFixed(2)}`
    );
  }

  if (data.temperature_zones && data.temperature_zones.length > 0) {
    notes.push(
      `Temperature zones detected: ${data.temperature_zones.length} regions`
    );
  }

  if (notes.length === 0) {
    return "No specific observations recorded.";
  }

  return notes.join(". ") + ".";
}

const DISCLAIMER_TEXT = `
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

For medical concerns, consult a qualified healthcare professional.
`;

/**
 * Validate image before sending to API
 */
export function validateImageForAnalysis(imageBase64: string): {
  valid: boolean;
  error?: string;
} {
  // Check if base64 string
  if (!imageBase64 || typeof imageBase64 !== "string") {
    return { valid: false, error: "Invalid image data" };
  }

  // Check size (example: max 10MB base64)
  if (imageBase64.length > 10 * 1024 * 1024) {
    return { valid: false, error: "Image too large (max 10MB)" };
  }

  // Check if it looks like base64
  const base64Regex = /^[A-Za-z0-9+/]+={0,2}$/;
  const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");

  if (!base64Regex.test(base64Data)) {
    return { valid: false, error: "Invalid base64 encoding" };
  }

  return { valid: true };
}

/**
 * Get supported analysis features
 */
export function getSupportedFeatures(): string[] {
  return [
    "skin_tone",
    "moisture_level",
    "texture_analysis",
    "temperature_zones",
  ];
}

/**
 * Check if YouCam service is available
 */
export async function checkYouCamStatus(): Promise<{
  available: boolean;
  configured: boolean;
  message: string;
}> {
  if (!YOUCAM_API_KEY) {
    return {
      available: false,
      configured: false,
      message: "YouCam API key not configured",
    };
  }

  try {
    // Ping the API to check if it's reachable
    // Adjust endpoint based on actual API
    const response = await axios.get(`${YOUCAM_BASE_URL}/status`, {
      headers: {
        Authorization: `Bearer ${YOUCAM_API_KEY}`,
      },
      timeout: 5000,
    });

    return {
      available: true,
      configured: true,
      message: "YouCam service operational",
    };
  } catch (error: any) {
    return {
      available: false,
      configured: true,
      message: `YouCam service unavailable: ${error.message}`,
    };
  }
}
