export interface ShotInput {
  uuid: string;
  velocity: number;
  diameterMm: number;
  weightGrams: number;
}

export interface ShotData extends ShotInput {
  id: number; // Sequential ID for display (1, 2, 3...)
  energyJoules: number;
  unitAreaEnergy: number; // J/cm^2
}

export interface StatisticalTestResult {
  tScore: number;
  pValue: number; // One-tailed
  degreesOfFreedom: number;
  criticalValue: number; // For 95% confidence
  rejectNull: boolean;
  interpretation: string;
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
  statisticalTest: StatisticalTestResult;
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