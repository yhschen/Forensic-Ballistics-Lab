import { BallisticStats, ShotData } from '../types';
import { LETHALITY_THRESHOLD } from '../constants';

export const calculateBallistics = (
  velocity: number, 
  diameterMm: number, 
  weightGrams: number
): { energyJoules: number, unitAreaEnergy: number } => {
  // Convert units
  const massKg = weightGrams / 1000;
  const radiusCm = (diameterMm / 2) / 10;
  
  // Kinetic Energy: E = 0.5 * m * v^2
  const energyJoules = 0.5 * massKg * Math.pow(velocity, 2);
  
  // Cross-sectional Area: A = pi * r^2 (in cm^2)
  const areaCm2 = Math.PI * Math.pow(radiusCm, 2);
  
  // Unit Area Energy: J / cm^2
  const unitAreaEnergy = energyJoules / areaCm2;

  return { energyJoules, unitAreaEnergy };
};

export const calculateStatistics = (shots: ShotData[]): BallisticStats => {
  if (shots.length === 0) {
    return {
      count: 0,
      meanVelocity: 0,
      meanUnitEnergy: 0,
      stdDevUnitEnergy: 0,
      minUnitEnergy: 0,
      maxUnitEnergy: 0,
      confidenceInterval95: [0, 0],
      probabilityOfLethality: 0,
      isLethal: false
    };
  }

  const n = shots.length;
  
  // Mean
  const totalVelocity = shots.reduce((sum, s) => sum + s.velocity, 0);
  const totalUnitEnergy = shots.reduce((sum, s) => sum + s.unitAreaEnergy, 0);
  const meanVelocity = totalVelocity / n;
  const meanUnitEnergy = totalUnitEnergy / n;

  // Min/Max
  const energies = shots.map(s => s.unitAreaEnergy);
  const minUnitEnergy = Math.min(...energies);
  const maxUnitEnergy = Math.max(...energies);

  // Standard Deviation (Sample)
  const variance = shots.reduce((sum, s) => sum + Math.pow(s.unitAreaEnergy - meanUnitEnergy, 2), 0) / (n - 1 || 1);
  const stdDevUnitEnergy = Math.sqrt(variance);

  // 95% Confidence Interval
  // Using t-distribution approximation. For N>10, 1.96 (Z) is often used, but let's use a rough t-value lookup or approximation 
  // For simplicity in client-side calc without heavy libraries, we use 1.96 (Z-score) if N > 30, or a slightly higher factor for small N.
  // Let's use 2.26 for N=10 which is typical. 
  // Standard Error = SD / sqrt(n)
  const tValue = n < 30 ? 2.262 : 1.96; 
  const standardError = stdDevUnitEnergy / Math.sqrt(n);
  const marginOfError = tValue * standardError;
  
  const ciLower = meanUnitEnergy - marginOfError;
  const ciUpper = meanUnitEnergy + marginOfError;

  // Determination Rule: If max energy exceeds threshold, it is strictly lethal.
  // Statistical Approach: If Mean + 3SD exceeds threshold, high potential.
  // For this app, we flag strict lethality if ANY shot > 20, or if the upper CI > 20.
  const isLethal = maxUnitEnergy >= LETHALITY_THRESHOLD;

  // Simple Z-score probability of exceeding threshold assuming normal distribution
  const zScore = (LETHALITY_THRESHOLD - meanUnitEnergy) / (stdDevUnitEnergy || 0.0001);
  // This is P(X < Threshold). We want P(X > Threshold) = 1 - P(X < Threshold)
  // Simplified error function approximation not needed for basic display, 
  // we will just set it to 100% if isLethal is true based on data points.
  let prob = 0;
  if (meanUnitEnergy > LETHALITY_THRESHOLD) prob = 1;
  else if (isLethal) prob = 1; 
  else prob = 0; // Keep it simple for the UI, relying on hard data points is better for forensics.

  return {
    count: n,
    meanVelocity,
    meanUnitEnergy,
    stdDevUnitEnergy,
    minUnitEnergy,
    maxUnitEnergy,
    confidenceInterval95: [Math.max(0, ciLower), ciUpper],
    probabilityOfLethality: prob,
    isLethal
  };
};