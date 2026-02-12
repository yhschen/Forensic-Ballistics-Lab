import { GoogleGenAI } from "@google/genai";
import { BallisticStats, ProjectileParams, ShotData } from '../types';
import { LETHALITY_THRESHOLD } from '../constants';

export const generateForensicReport = async (
  stats: BallisticStats,
  params: ProjectileParams,
  shots: ShotData[]
): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Detect if mixed ammo was used
  const uniqueWeights = new Set(shots.map(s => s.weightGrams));
  const uniqueDias = new Set(shots.map(s => s.diameterMm));
  const isVariable = uniqueWeights.size > 1 || uniqueDias.size > 1;

  let paramSection = '';
  if (isVariable) {
    paramSection = `
    Test Parameters: Mixed Ammunition Used
    - Projectile Weights: ${Array.from(uniqueWeights).sort((a,b)=>a-b).join(', ')} g
    - Projectile Diameters: ${Array.from(uniqueDias).sort((a,b)=>a-b).join(', ')} mm
    `;
  } else {
    paramSection = `
    Test Parameters:
    - Projectile Diameter: ${params.diameterMm} mm
    - Projectile Weight: ${params.weightGrams} g
    `;
  }

  const shotDataString = shots.map((s, i) => 
    `Shot ${i+1} (${s.weightGrams}g, ${s.diameterMm}mm): ${s.unitAreaEnergy.toFixed(2)} J/cm²`
  ).join('\n    ');

  const test = stats.statisticalTest;

  const prompt = `
    You are a professional Forensic Ballistics Expert (Witness for the Court).
    
    Task: Write a formal "Conclusion of Appraisal" (鑑定結論) regarding the potential lethality of an air gun based on the provided test data.
    
    Legal Standard: An air gun is considered to have "potential lethality" (具有殺傷力) if the kinetic energy per unit area of the metal projectile exceeds ${LETHALITY_THRESHOLD} J/cm².
    
    ${paramSection}
    
    Test Results (Kinetic Energy per Unit Area):
    - Raw Data: 
    ${shotDataString}
    
    - Sample Size: ${stats.count}
    - Mean: ${stats.meanUnitEnergy.toFixed(2)} J/cm²
    - Max: ${stats.maxUnitEnergy.toFixed(2)} J/cm²
    - Standard Deviation: ${stats.stdDevUnitEnergy.toFixed(3)}
    
    Statistical Hypothesis Test (One-Sample t-Test against 20 J/cm²):
    - T-Statistic: ${test.tScore.toFixed(3)}
    - P-Value: ${test.pValue.toFixed(4)}
    - Conclusion: ${test.interpretation}
    - Reject Null Hypothesis (H0: <= 20): ${test.rejectNull ? 'YES' : 'NO'}
    
    Instructions:
    1. Write in a formal, objective, and authoritative tone suitable for a legal report.
    2. Explicitly compare the test results (Mean and Max) against the statutory standard of ${LETHALITY_THRESHOLD} J/cm².
    3. Include a dedicated section discussing the **Statistical Significance** of the findings. Mention the t-test results to support whether the data proves the gun is lethal or non-lethal with 95% confidence.
    4. If ANY shot exceeds 20 J/cm², the conclusion MUST state the gun is capable of inflicting injury ("Potentially Lethal").
    5. If all shots are well below 20 J/cm², state it is non-lethal.
    6. Keep it concise (under 200 words).
    7. Use standard Markdown for formatting.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "Unable to generate report.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error generating forensic report. Please check API configuration.";
  }
};