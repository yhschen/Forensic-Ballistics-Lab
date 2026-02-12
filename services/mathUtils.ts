import { BallisticStats, ShotData } from '../types';
import { LETHALITY_THRESHOLD } from '../constants';

// Lanczos approximation for Gamma function
const gamma = (z: number): number => {
  const g = 7;
  const C = [
    0.99999999999980993, 676.5203681218851, -1259.1392167224028,
    771.32342877765313, -176.61502916214059, 12.507343278686905,
    -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7
  ];
  if (z < 0.5) return Math.PI / (Math.sin(Math.PI * z) * gamma(1 - z));
  z -= 1;
  let x = C[0];
  for (let i = 1; i < 9; i++) x += C[i] / (z + i);
  const t = z + g + 0.5;
  return Math.sqrt(2 * Math.PI) * Math.pow(t, z + 0.5) * Math.exp(-t) * x;
};

// Probability Density Function for Student's t-distribution
const studentTPDF = (t: number, df: number): number => {
  const numerator = gamma((df + 1) / 2);
  const denominator = Math.sqrt(df * Math.PI) * gamma(df / 2);
  const base = 1 + (t * t) / df;
  const power = -(df + 1) / 2;
  return (numerator / denominator) * Math.pow(base, power);
};

// Simple numerical integration (Simpson's rule) for CDF
// Calculates P(T > t) for one-tailed test
const calculateOneTailedPValue = (tScore: number, df: number): number => {
  if (df <= 0) return 0;
  
  // We want the area in the tail.
  // The distribution is symmetric.
  const absT = Math.abs(tScore);
  
  // Integrate from 0 to absT
  const n = 1000; // intervals
  const h = absT / n;
  let sum = studentTPDF(0, df) + studentTPDF(absT, df);
  
  for (let i = 1; i < n; i += 2) {
    sum += 4 * studentTPDF(i * h, df);
  }
  for (let i = 2; i < n - 1; i += 2) {
    sum += 2 * studentTPDF(i * h, df);
  }
  
  const integral0toT = (h / 3) * sum;
  
  // Total area is 1. Area from 0 to infinity is 0.5.
  // P(T > |t|) = 0.5 - integral(0 to |t|)
  let pTail = 0.5 - integral0toT;
  
  // Clamp for floating point errors
  if (pTail < 0) pTail = 0;
  if (pTail > 0.5) pTail = 0.5;

  // If we are testing H1: Mean > 20
  // If tScore is positive, p-value is the right tail (pTail).
  // If tScore is negative, p-value is 1 - pTail (very large p-value, fail to reject).
  // However, usually p-value reported is for the tail direction of the hypothesis.
  // Let's return the tail area probability for the observed deviation.
  return pTail; 
};

export const calculateBallistics = (
  velocity: number, 
  diameterMm: number, 
  weightGrams: number
): { energyJoules: number, unitAreaEnergy: number } => {
  const massKg = weightGrams / 1000;
  const radiusCm = (diameterMm / 2) / 10;
  const energyJoules = 0.5 * massKg * Math.pow(velocity, 2);
  const areaCm2 = Math.PI * Math.pow(radiusCm, 2);
  const unitAreaEnergy = energyJoules / areaCm2;
  return { energyJoules, unitAreaEnergy };
};

export const calculateStatistics = (shots: ShotData[]): BallisticStats => {
  const defaultStats = {
    count: 0,
    meanVelocity: 0,
    meanUnitEnergy: 0,
    stdDevUnitEnergy: 0,
    minUnitEnergy: 0,
    maxUnitEnergy: 0,
    confidenceInterval95: [0, 0] as [number, number],
    probabilityOfLethality: 0,
    isLethal: false,
    statisticalTest: {
      tScore: 0,
      pValue: 1,
      degreesOfFreedom: 0,
      criticalValue: 0,
      rejectNull: false,
      interpretation: "Insufficient data"
    }
  };

  if (shots.length === 0) return defaultStats;

  const n = shots.length;
  const totalVelocity = shots.reduce((sum, s) => sum + s.velocity, 0);
  const totalUnitEnergy = shots.reduce((sum, s) => sum + s.unitAreaEnergy, 0);
  const meanVelocity = totalVelocity / n;
  const meanUnitEnergy = totalUnitEnergy / n;
  
  const energies = shots.map(s => s.unitAreaEnergy);
  const minUnitEnergy = Math.min(...energies);
  const maxUnitEnergy = Math.max(...energies);

  const variance = shots.reduce((sum, s) => sum + Math.pow(s.unitAreaEnergy - meanUnitEnergy, 2), 0) / (n - 1 || 1);
  const stdDevUnitEnergy = Math.sqrt(variance);

  // Confidence Interval
  // Critical t-value for 95% CI (two-tailed 0.05, or one-tailed 0.025 for upper bound?)
  // For standard CI, we use two-tailed alpha=0.05
  // Rough approximation for T-critical: 1.96 + (2.4/df) for small samples
  const df = n - 1;
  const tCritical95 = df > 0 ? (1.96 + (2.4 / df)) : 1.96; 
  const standardError = stdDevUnitEnergy / Math.sqrt(n);
  const marginOfError = tCritical95 * standardError;
  
  const ciLower = meanUnitEnergy - marginOfError;
  const ciUpper = meanUnitEnergy + marginOfError;

  // Determine Lethality (Strict Rule: Any shot > 20)
  const isLethal = maxUnitEnergy >= LETHALITY_THRESHOLD;

  // --- Hypothesis Testing ---
  // H0: mu <= 20 (Non-lethal)
  // H1: mu > 20 (Lethal)
  // We calculate t-score relative to the threshold
  let tScore = 0;
  if (standardError > 0) {
    tScore = (meanUnitEnergy - LETHALITY_THRESHOLD) / standardError;
  }
  
  // Calculate P-value (Right-tailed if mean > 20, Left-tailed if mean < 20)
  // But generally we want "Significance of deviation from 20"
  // For the report, we check if it is *Significantly Greater* than 20.
  
  let pValue = 0.5; // Default
  if (df > 0) {
    // If mean > 20, we look at area to the right of T
    if (tScore > 0) {
       pValue = calculateOneTailedPValue(tScore, df);
    } else {
       // If mean < 20, the p-value for "Greater than 20" is large (area to right is > 0.5)
       // But maybe we want to test if it's significantly *lower* (Safe).
       // Let's report the p-value corresponding to the direction of the mean.
       pValue = calculateOneTailedPValue(tScore, df);
    }
  }

  // Interpretation
  let interpretation = "";
  let rejectNull = false;
  
  if (meanUnitEnergy > LETHALITY_THRESHOLD) {
    if (pValue < 0.05) {
      interpretation = "Statistically Significant: Lethal (Reject H₀)";
      rejectNull = true;
    } else {
      interpretation = "Above Threshold but Not Statistically Significant (Insufficient Evidence)";
    }
  } else {
    if (pValue < 0.05) {
      interpretation = "Statistically Significant: Safe/Non-Lethal";
      rejectNull = true;
    } else {
      interpretation = "Below Threshold (Within Margin of Error)";
    }
  }

  return {
    count: n,
    meanVelocity,
    meanUnitEnergy,
    stdDevUnitEnergy,
    minUnitEnergy,
    maxUnitEnergy,
    confidenceInterval95: [Math.max(0, ciLower), ciUpper],
    probabilityOfLethality: 0, // Deprecated in favor of rigorous test
    isLethal,
    statisticalTest: {
      tScore,
      pValue,
      degreesOfFreedom: df,
      criticalValue: tCritical95,
      rejectNull,
      interpretation
    }
  };
};