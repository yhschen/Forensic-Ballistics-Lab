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
  
  const shotDataString = shots.map((s, i) => `Shot ${i+1}: ${s.unitAreaEnergy.toFixed(2)} J/cm²`).join(', ');

  const prompt = `
    You are a professional Forensic Ballistics Expert (Witness for the Court).
    
    Task: Write a formal "Conclusion of Appraisal" (鑑定結論) regarding the potential lethality of an air gun based on the provided test data.
    
    Legal Standard: An air gun is considered to have "potential lethality" (具有殺傷力) if the kinetic energy per unit area of the metal projectile exceeds ${LETHALITY_THRESHOLD} J/cm².
    
    Test Parameters:
    - Projectile Diameter: ${params.diameterMm} mm
    - Projectile Weight: ${params.weightGrams} g
    
    Test Results (Kinetic Energy per Unit Area):
    - Raw Data: [${shotDataString}]
    - Sample Size: ${stats.count}
    - Mean: ${stats.meanUnitEnergy.toFixed(2)} J/cm²
    - Max: ${stats.maxUnitEnergy.toFixed(2)} J/cm²
    - Standard Deviation: ${stats.stdDevUnitEnergy.toFixed(3)}
    
    Instructions:
    1. Write in a formal, objective, and authoritative tone suitable for a legal report.
    2. Explicitly compare the test results (specifically the Max and Mean) against the statutory standard of ${LETHALITY_THRESHOLD} J/cm².
    3. If ANY shot exceeds 20 J/cm², the conclusion MUST state the gun is capable of inflicting injury ("Potentially Lethal").
    4. If all shots are well below 20 J/cm², state it is non-lethal.
    5. Briefly explain the statistical consistency (standard deviation) to validate the reliability of the test.
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