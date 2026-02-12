export interface ShotData {
  id: number;
  velocity: number; // m/s
  energyJoules: number;
  unitAreaEnergy: number; // J/cm^2
}

export interface BallisticStats {
  count: number;
  meanVelocity: number;
  meanUnitEnergy: number;
  stdDevUnitEnergy: number;
  minUnitEnergy: number;
  maxUnitEnergy: number;
  confidenceInterval95: [number, number]; // [lower, upper]
  probabilityOfLethality: number; // Simplified Z-score based probability exceeding threshold
  isLethal: boolean;
}

export interface ProjectileParams {
  diameterMm: number;
  weightGrams: number;
}

export enum AnalysisStatus {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR'
}