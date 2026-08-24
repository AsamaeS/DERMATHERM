// ================================================================
// DERMATHERM FRONTEND — API Client
// ================================================================

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export interface Material {
  id: string;
  name: string;
  category: string;
  parameters: {
    k: ParameterEvidence;
    D_eff: ParameterEvidence;
    thickness: ParameterEvidence;
    rho: ParameterEvidence;
    cp: ParameterEvidence;
  };
  created_at: string;
  updated_at: string;
}

export interface ParameterEvidence {
  value: number | [number, number];
  unit: string;
  status: "LITERATURE-SUPPORTED" | "ASSUMED / DEMONSTRATION" | "NOT VERIFIED";
  source?: string;
  doi?: string;
  experimental_conditions?: string;
  quote?: string;
  confidence?: "MEASURED" | "REPORTED" | "DERIVED" | "ASSUMED";
  notes?: string;
}

export interface Experiment {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
  status: "CONFIGURED" | "RUNNING" | "COMPLETED" | "FAILED";
  climate: {
    T_inf: number;
    RH_inf: number;
    v_air: number;
    sweat_rate: number;
    T_skin: number;
  };
  material_id: string;
  parameters: {
    k: number;
    D_eff: number;
    thickness: number;
    rho: number;
    cp: number;
  };
  scenario: "homo" | "weave" | "pores" | "seam";
  hotspot: boolean;
  solver: {
    type: "FTCS_2D";
    grid: { nx: number; ny: number };
    dt_method: "CFL_limited";
    version: string;
  };
  results?: ExperimentResults;
  limitations: string[];
  assumptions: string[];
  research_question?: string;
}

export interface ExperimentResults {
  metrics: {
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
  };
  conservation_check: {
    mass_balance_error: number;
    passed: boolean;
  };
  timestamp: string;
}

// ================================================================
// API Client Class
// ================================================================

class APIClient {
  private baseURL: string;

  constructor(baseURL: string = API_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Unknown error" }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // ================================================================
  // Materials
  // ================================================================

  async getMaterials(): Promise<Material[]> {
    const result = await this.request<{ materials: Material[] }>("/api/materials");
    return result.materials;
  }

  async getMaterial(id: string): Promise<Material> {
    const result = await this.request<{ material: Material }>(`/api/materials/${id}`);
    return result.material;
  }

  async createMaterial(material: Omit<Material, "id" | "created_at" | "updated_at">): Promise<Material> {
    const result = await this.request<{ material: Material }>("/api/materials", {
      method: "POST",
      body: JSON.stringify(material),
    });
    return result.material;
  }

  async updateMaterial(id: string, updates: Partial<Material>): Promise<Material> {
    const result = await this.request<{ material: Material }>(`/api/materials/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
    return result.material;
  }

  async deleteMaterial(id: string): Promise<void> {
    await this.request(`/api/materials/${id}`, {
      method: "DELETE",
    });
  }

  // ================================================================
  // Experiments
  // ================================================================

  async getExperiments(): Promise<Experiment[]> {
    const result = await this.request<{ experiments: Experiment[] }>("/api/experiments");
    return result.experiments;
  }

  async getExperiment(id: string): Promise<Experiment> {
    const result = await this.request<{ experiment: Experiment }>(`/api/experiments/${id}`);
    return result.experiment;
  }

  async createExperiment(
    experiment: Omit<Experiment, "id" | "created_at" | "updated_at" | "status" | "results">
  ): Promise<Experiment> {
    const result = await this.request<{ experiment: Experiment }>("/api/experiments", {
      method: "POST",
      body: JSON.stringify(experiment),
    });
    return result.experiment;
  }

  async updateExperimentStatus(
    id: string,
    status: Experiment["status"]
  ): Promise<Experiment> {
    const result = await this.request<{ experiment: Experiment }>(
      `/api/experiments/${id}/status`,
      {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }
    );
    return result.experiment;
  }

  async saveExperimentResults(
    id: string,
    results: ExperimentResults
  ): Promise<Experiment> {
    const result = await this.request<{ experiment: Experiment }>(
      `/api/experiments/${id}/results`,
      {
        method: "POST",
        body: JSON.stringify(results),
      }
    );
    return result.experiment;
  }

  async exportExperiment(id: string): Promise<Blob> {
    const response = await fetch(`${this.baseURL}/api/experiments/${id}/export?format=json`);
    if (!response.ok) {
      throw new Error(`Export failed: ${response.status}`);
    }
    return response.blob();
  }

  // ================================================================
  // Health Check
  // ================================================================

  async health(): Promise<{
    status: string;
    timestamp: string;
    services: Record<string, string>;
    version: string;
  }> {
    return this.request("/api/health");
  }
}

// Export singleton instance
export const api = new APIClient();
