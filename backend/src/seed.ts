// ================================================================
// DERMATHERM BACKEND — Database Seed with Default Materials
// ================================================================

import { createMaterial } from "./db.js";
import type { Material } from "./types.js";

export function seedDefaultMaterials() {
  const materials: Omit<Material, "id" | "created_at" | "updated_at">[] = [
    {
      name: "Cotton fabric — handbook range",
      category: "Natural textile",
      parameters: {
        k: {
          value: [0.03, 0.06],
          unit: "W/(m·K)",
          status: "LITERATURE-SUPPORTED",
          source: "ASHRAE Handbook—Fundamentals (clothing chapter)",
          confidence: "REPORTED",
          notes: "Typical range for clothing fabrics in still air. Actual value depends on weave, moisture content, and compression.",
        },
        D_eff: {
          value: [1e-6, 1e-5],
          unit: "m²/s",
          status: "NOT VERIFIED",
          notes: "Order-of-magnitude estimate. Depends on porosity and tortuosity. Requires experimental characterization.",
        },
        thickness: {
          value: [0.3, 3.0],
          unit: "mm",
          status: "LITERATURE-SUPPORTED",
          notes: "Typical apparel fabric range. Directly measurable per specimen.",
        },
        rho: {
          value: 400,
          unit: "kg/m³",
          status: "ASSUMED / DEMONSTRATION",
          notes: "Bulk textile density. Structure-dependent. Used as prototype default.",
        },
        cp: {
          value: 1300,
          unit: "J/(kg·K)",
          status: "LITERATURE-SUPPORTED",
          source: "Textile handbooks (typical cotton fibre)",
          confidence: "REPORTED",
          notes: "Fibre-level property. Bulk textile value may differ.",
        },
      },
    },
    {
      name: "Homogeneous textile baseline",
      category: "Computational baseline",
      parameters: {
        k: {
          value: 0.045,
          unit: "W/(m·K)",
          status: "ASSUMED / DEMONSTRATION",
          notes: "Baseline value used by the in-browser solver. Declared assumption, not a measurement.",
        },
        D_eff: {
          value: 1.0e-5,
          unit: "m²/s",
          status: "ASSUMED / DEMONSTRATION",
          notes: "Baseline value for demonstration purposes. Not verified experimentally.",
        },
        thickness: {
          value: 1.2,
          unit: "mm",
          status: "ASSUMED / DEMONSTRATION",
          notes: "Representative thickness for sensitivity analysis.",
        },
        rho: {
          value: 400,
          unit: "kg/m³",
          status: "ASSUMED / DEMONSTRATION",
          notes: "Bulk textile density assumption.",
        },
        cp: {
          value: 1300,
          unit: "J/(kg·K)",
          status: "ASSUMED / DEMONSTRATION",
          notes: "Specific heat assumption.",
        },
      },
    },
    {
      name: "Plain weave heterogeneous scenario",
      category: "Computational scenario",
      parameters: {
        k: {
          value: [0.025, 0.10],
          unit: "W/(m·K)",
          status: "ASSUMED / DEMONSTRATION",
          notes: "Spatially-varying thermal conductivity scenario for 2D heterogeneity experiments. Not a registered commercial textile.",
        },
        D_eff: {
          value: [0.3e-5, 3.0e-5],
          unit: "m²/s",
          status: "ASSUMED / DEMONSTRATION",
          notes: "Spatially-varying moisture diffusivity scenario.",
        },
        thickness: {
          value: 1.2,
          unit: "mm",
          status: "ASSUMED / DEMONSTRATION",
          notes: "Fixed thickness for heterogeneity study.",
        },
        rho: {
          value: 400,
          unit: "kg/m³",
          status: "ASSUMED / DEMONSTRATION",
          notes: "Uniform bulk density assumption.",
        },
        cp: {
          value: 1300,
          unit: "J/(kg·K)",
          status: "ASSUMED / DEMONSTRATION",
          notes: "Uniform specific heat assumption.",
        },
      },
    },
  ];

  for (const material of materials) {
    const created = createMaterial(material);
    console.log(`  ✓ Created material: ${created.id} — ${created.name}`);
  }
}
