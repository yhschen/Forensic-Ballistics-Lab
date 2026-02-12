import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { InputSection } from './components/InputSection';
import { AnalysisResults } from './components/AnalysisResults';
import { calculateBallistics, calculateStatistics } from './services/mathUtils';
import { generateForensicReport } from './services/geminiService';
import { ShotData, BallisticStats, ProjectileParams, AnalysisStatus } from './types';
import { DEFAULT_PROJECTILE, SAMPLE_DATA } from './constants';

const App: React.FC = () => {
  const [params, setParams] = useState<ProjectileParams>(DEFAULT_PROJECTILE);
  const [velocities, setVelocities] = useState<number[]>([]);
  const [shotData, setShotData] = useState<ShotData[]>([]);
  const [stats, setStats] = useState<BallisticStats | null>(null);
  const [aiReport, setAiReport] = useState<string>('');
  const [status, setStatus] = useState<AnalysisStatus>(AnalysisStatus.IDLE);

  const runAnalysis = async () => {
    setStatus(AnalysisStatus.ANALYZING);
    
    // 1. Calculate Per-Shot Data
    const calculatedShots: ShotData[] = velocities.map((v, index) => {
      const { energyJoules, unitAreaEnergy } = calculateBallistics(v, params.diameterMm, params.weightGrams);
      return {
        id: index + 1,
        velocity: v,
        energyJoules,
        unitAreaEnergy
      };
    });

    setShotData(calculatedShots);

    // 2. Calculate Statistics
    const calculatedStats = calculateStatistics(calculatedShots);
    setStats(calculatedStats);

    // 3. Generate AI Report
    try {
      const report = await generateForensicReport(calculatedStats, params, calculatedShots);
      setAiReport(report);
      setStatus(AnalysisStatus.COMPLETE);
    } catch (e) {
      console.error(e);
      setAiReport("Failed to generate AI report.");
      setStatus(AnalysisStatus.ERROR);
    }
  };

  // Optional: Load sample data on mount for demo
  useEffect(() => {
    // Only load sample if needed, here we leave it empty for the user to start fresh
    // setVelocities(SAMPLE_DATA);
  }, []);

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-slate-900">Kinetic Energy Analysis</h2>
          <p className="text-slate-500 mt-2 max-w-2xl mx-auto">
            Input projectile parameters and chronograph velocity readings to determine if the firearm meets the 
            statutory lethality threshold of <span className="font-mono font-bold text-slate-700">20 J/cm²</span>.
          </p>
        </div>

        <InputSection 
          params={params}
          setParams={setParams}
          velocities={velocities}
          setVelocities={setVelocities}
          onAnalyze={runAnalysis}
          isAnalyzing={status === AnalysisStatus.ANALYZING}
        />

        {status === AnalysisStatus.COMPLETE && stats && (
          <AnalysisResults 
            stats={stats}
            data={shotData}
            aiReport={aiReport}
          />
        )}
      </div>
    </Layout>
  );
};

export default App;