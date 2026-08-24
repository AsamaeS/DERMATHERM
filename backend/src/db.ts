// ================================================================
// DERMATHERM BACKEND — Database Layer (SQLite)
// ================================================================

import Database from "better-sqlite3";
import { Material, Experiment, MLModel } from "./types.js";
import { v4 as uuidv4 } from "uuid";

const db = new Database(process.env.DATABASE_PATH || "./data/dermatherm.db");

// ================================================================
// SCHEMA INITIALIZATION
// ================================================================

export function initializeDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS materials (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      parameters TEXT NOT NULL, -- JSON
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS experiments (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      status TEXT NOT NULL,
      climate TEXT NOT NULL, -- JSON
      material_id TEXT NOT NULL,
      parameters TEXT NOT NULL, -- JSON
      scenario TEXT NOT NULL,
      hotspot INTEGER NOT NULL,
      solver TEXT NOT NULL, -- JSON
      results TEXT, -- JSON, nullable
      limitations TEXT NOT NULL, -- JSON array
      assumptions TEXT NOT NULL, -- JSON array
      research_question TEXT,
      FOREIGN KEY (material_id) REFERENCES materials(id)
    );

    CREATE TABLE IF NOT EXISTS ml_models (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      architecture TEXT NOT NULL, -- JSON
      training_config TEXT NOT NULL, -- JSON
      trained_on TEXT NOT NULL, -- JSON array of experiment IDs
      metrics TEXT NOT NULL, -- JSON
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS literature_evidence (
      id TEXT PRIMARY KEY,
      paper TEXT NOT NULL,
      authors TEXT NOT NULL, -- JSON array
      year TEXT NOT NULL,
      doi TEXT NOT NULL,
      material TEXT NOT NULL,
      parameter TEXT NOT NULL,
      value TEXT NOT NULL,
      unit TEXT NOT NULL,
      experimental_conditions TEXT,
      source_quote TEXT NOT NULL,
      confidence TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_experiments_status ON experiments(status);
    CREATE INDEX IF NOT EXISTS idx_experiments_material ON experiments(material_id);
    CREATE INDEX IF NOT EXISTS idx_materials_category ON materials(category);
  `);
  
  console.log("✓ Database initialized");
}

// ================================================================
// MATERIALS
// ================================================================

export function createMaterial(material: Omit<Material, "id" | "created_at" | "updated_at">): Material {
  const now = new Date().toISOString();
  const id = `MAT-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9999)).padStart(4, "0")}`;
  
  const full: Material = {
    id,
    ...material,
    created_at: now,
    updated_at: now,
  };
  
  const stmt = db.prepare(`
    INSERT INTO materials (id, name, category, parameters, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  
  stmt.run(
    full.id,
    full.name,
    full.category,
    JSON.stringify(full.parameters),
    full.created_at,
    full.updated_at
  );
  
  return full;
}

export function getMaterial(id: string): Material | null {
  const stmt = db.prepare("SELECT * FROM materials WHERE id = ?");
  const row = stmt.get(id) as any;
  
  if (!row) return null;
  
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    parameters: JSON.parse(row.parameters),
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export function getAllMaterials(): Material[] {
  const stmt = db.prepare("SELECT * FROM materials ORDER BY created_at DESC");
  const rows = stmt.all() as any[];
  
  return rows.map(row => ({
    id: row.id,
    name: row.name,
    category: row.category,
    parameters: JSON.parse(row.parameters),
    created_at: row.created_at,
    updated_at: row.updated_at,
  }));
}

export function updateMaterial(id: string, updates: Partial<Material>): Material | null {
  const existing = getMaterial(id);
  if (!existing) return null;
  
  const updated: Material = {
    ...existing,
    ...updates,
    id: existing.id, // Prevent ID change
    created_at: existing.created_at,
    updated_at: new Date().toISOString(),
  };
  
  const stmt = db.prepare(`
    UPDATE materials
    SET name = ?, category = ?, parameters = ?, updated_at = ?
    WHERE id = ?
  `);
  
  stmt.run(
    updated.name,
    updated.category,
    JSON.stringify(updated.parameters),
    updated.updated_at,
    id
  );
  
  return updated;
}

export function deleteMaterial(id: string): boolean {
  const stmt = db.prepare("DELETE FROM materials WHERE id = ?");
  const info = stmt.run(id);
  return info.changes > 0;
}

// ================================================================
// EXPERIMENTS
// ================================================================

export function createExperiment(
  experiment: Omit<Experiment, "id" | "created_at" | "updated_at" | "status" | "results">
): Experiment {
  const now = new Date().toISOString();
  const id = `EXP-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9999)).padStart(4, "0")}`;
  
  const full: Experiment = {
    id,
    created_at: now,
    updated_at: now,
    status: "CONFIGURED",
    ...experiment,
  };
  
  const stmt = db.prepare(`
    INSERT INTO experiments (
      id, name, description, created_at, updated_at, status,
      climate, material_id, parameters, scenario, hotspot,
      solver, results, limitations, assumptions, research_question
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  stmt.run(
    full.id,
    full.name,
    full.description || null,
    full.created_at,
    full.updated_at,
    full.status,
    JSON.stringify(full.climate),
    full.material_id,
    JSON.stringify(full.parameters),
    full.scenario,
    full.hotspot ? 1 : 0,
    JSON.stringify(full.solver),
    null,
    JSON.stringify(full.limitations),
    JSON.stringify(full.assumptions),
    full.research_question || null
  );
  
  return full;
}

export function getExperiment(id: string): Experiment | null {
  const stmt = db.prepare("SELECT * FROM experiments WHERE id = ?");
  const row = stmt.get(id) as any;
  
  if (!row) return null;
  
  return parseExperimentRow(row);
}

export function getAllExperiments(): Experiment[] {
  const stmt = db.prepare("SELECT * FROM experiments ORDER BY created_at DESC");
  const rows = stmt.all() as any[];
  
  return rows.map(parseExperimentRow);
}

export function updateExperimentStatus(id: string, status: Experiment["status"]): Experiment | null {
  const stmt = db.prepare(`
    UPDATE experiments
    SET status = ?, updated_at = ?
    WHERE id = ?
  `);
  
  const now = new Date().toISOString();
  stmt.run(status, now, id);
  
  return getExperiment(id);
}

export function saveExperimentResults(id: string, results: Experiment["results"]): Experiment | null {
  const stmt = db.prepare(`
    UPDATE experiments
    SET results = ?, status = ?, updated_at = ?
    WHERE id = ?
  `);
  
  const now = new Date().toISOString();
  stmt.run(JSON.stringify(results), "COMPLETED", now, id);
  
  return getExperiment(id);
}

function parseExperimentRow(row: any): Experiment {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    created_at: row.created_at,
    updated_at: row.updated_at,
    status: row.status,
    climate: JSON.parse(row.climate),
    material_id: row.material_id,
    parameters: JSON.parse(row.parameters),
    scenario: row.scenario,
    hotspot: row.hotspot === 1,
    solver: JSON.parse(row.solver),
    results: row.results ? JSON.parse(row.results) : undefined,
    limitations: JSON.parse(row.limitations),
    assumptions: JSON.parse(row.assumptions),
    research_question: row.research_question,
  };
}

// ================================================================
// ML MODELS
// ================================================================

export function saveMLModel(model: Omit<MLModel, "id" | "created_at">): MLModel {
  const now = new Date().toISOString();
  const id = `MODEL-${new Date().getFullYear()}-${uuidv4().slice(0, 8)}`;
  
  const full: MLModel = {
    id,
    created_at: now,
    ...model,
  };
  
  const stmt = db.prepare(`
    INSERT INTO ml_models (
      id, name, type, architecture, training_config,
      trained_on, metrics, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  stmt.run(
    full.id,
    full.name,
    full.type,
    JSON.stringify(full.architecture),
    JSON.stringify(full.training_config),
    JSON.stringify(full.trained_on),
    JSON.stringify(full.metrics),
    full.created_at
  );
  
  return full;
}

export function getMLModel(id: string): MLModel | null {
  const stmt = db.prepare("SELECT * FROM ml_models WHERE id = ?");
  const row = stmt.get(id) as any;
  
  if (!row) return null;
  
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    architecture: JSON.parse(row.architecture),
    training_config: JSON.parse(row.training_config),
    trained_on: JSON.parse(row.trained_on),
    metrics: JSON.parse(row.metrics),
    created_at: row.created_at,
  };
}

export function getAllMLModels(): MLModel[] {
  const stmt = db.prepare("SELECT * FROM ml_models ORDER BY created_at DESC");
  const rows = stmt.all() as any[];
  
  return rows.map(row => ({
    id: row.id,
    name: row.name,
    type: row.type,
    architecture: JSON.parse(row.architecture),
    training_config: JSON.parse(row.training_config),
    trained_on: JSON.parse(row.trained_on),
    metrics: JSON.parse(row.metrics),
    created_at: row.created_at,
  }));
}

export { db };
