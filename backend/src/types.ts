// ================================================================
// DERMATHERM BACKEND — Type Definitions
// ================================================================

export type EvidenceStatus = 
  | "LITERATURE-SUPPORTED" 
  | "ASSUMED / DEMONSTRATION" 
  | "NOT VERIFIED";

export type ConfidenceLevel = 
  | "MEASURED" 
  | "REPORTED" 
  | "DERIVED" 
  | "ASSUMED";

export interface ParameterEvidence {
  value: number | [number, number]; // Single value or range
  unit: string;
  status: EvidenceStatus;
  source?: string;
  doi?: string;
  experimental_conditions?: string;
  quote?: string; // Verbatim from paper
  confidence?: ConfidenceLevel;
  notes?: string;
}

export interface Material {
  id: string; // MAT-YYYY-NNN
  name: string;
  category: string;
  parameters: {
    k: ParameterEvidence; // Thermal conductivity
    D_eff: ParameterEvidence; // Moisture diffusivity
    thickness: ParameterEvidence;
    rho: ParameterEvidence; // Density
    cp: ParameterEvidence; // Specific heat
  };
  created_at: string;
  updated_at: string;
}

export type ExperimentStatus = 
  | "CONFIGURED" 
  | "RUNNING" 
  | "COMPLETED" 
  | "FAILED";

export type Scenario = "homo" | "weave" | "pores" | "seam";

export interface ClimateConfig {
  T_inf: number; // Ambient temperature, °C
  RH_inf: number; // Relative humidity, %
  v_air: number; // Air velocity, m/s
  sweat_rate: number; // g/m²/h
  T_skin: number; // Skin temperature, °C (boundary condition)
}

export interface MaterialParameters {
  k: number; // W/(m·K)
  D_eff: number; // m²/s
  thickness: number; // mm
  rho: number; // kg/m³
  cp: number; // J/(kg·K)
}

export interface SolverConfig {
  type: "FTCS_2D";
  grid: {
    nx: number;
    ny: number;
  };
  dt_method: "CFL_limited";
  version: string;
}

export interface SimMetrics {
  tSim: number;
  dt: number;
  steps: number;
  evapGm2h: number;
  latentWm2: number;
  TsurfMin: number;
  TsurfMax: number;
  cSurfMean: number;
  massErrRel: number;
  steady: boolean;
}

export interface ExperimentResults {
  fields?: {
    T?: number[][]; // Can be compressed in real implementation
    C_v?: number[][];
  };
  metrics: SimMetrics;
  conservation_check: {
    mass_balance_error: number;
    passed: boolean;
  };
  timestamp: string;
}

export interface Experiment {
  id: string; // EXP-YYYY-NNN
  created_at: string;
  updated_at: string;
  status: ExperimentStatus;
  
  // Configuration
  name: string;
  description?: string;
  climate: ClimateConfig;
  material_id: string;
  parameters: MaterialParameters; // Snapshot at creation
  scenario: Scenario;
  hotspot: boolean;
  
  // Solver configuration
  solver: SolverConfig;
  
  // Results (populated after completion)
  results?: ExperimentResults;
  
  // Provenance
  limitations: string[]; // e.g., ["L-01", "L-06"]
  assumptions: string[];
  research_question?: string;
}

// Evidence extraction schema (for Qwen)
export interface LiteratureEvidence {
  paper: string;
  authors: string[];
  year: string;
  doi: string;
  material: string;
  parameter: string;
  value: string;
  unit: string;
  experimental_conditions: string;
  temperature?: string;
  relative_humidity?: string;
  textile_structure?: string;
  thickness?: string;
  measurement_method?: string;
  uncertainty?: string;
  source_quote: string;
  confidence: ConfidenceLevel;
}

// ML Model metadata
export interface MLModel {
  id: string;
  name: string;
  type: "PINN" | "DATA_ONLY";
  architecture: {
    layers: number[];
    activation: string;
  };
  training_config: {
    n_data: number;
    n_collocation: number;
    epochs: number;
    lr: number;
  };
  trained_on: string[]; // Experiment IDs
  metrics: {
    rmse: number;
    relL2: number;
    resNorm?: number;
  };
  created_at: string;
}
