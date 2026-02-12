import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, 
  ComposedChart, Line
} from 'recharts';
import { BallisticStats, ShotData } from '../types';
import { LETHALITY_THRESHOLD } from '../constants';
import { AlertTriangle, CheckCircle, BrainCircuit } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface AnalysisResultsProps {
  stats: BallisticStats;
  data: ShotData[];
  aiReport: string;
}

export const AnalysisResults: React.FC<AnalysisResultsProps> = ({ stats, data, aiReport }) => {
  const chartData = data.map((d) => ({
    name: `#${d.id}`,
    energy: d.unitAreaEnergy,
    velocity: d.velocity
  }));

  const isLethal = stats.isLethal;

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      
      {/* Top Level Status Badge */}
      <div className={`p-6 rounded-xl border-l-8 shadow-md flex items-start gap-4 ${
        isLethal 
          ? 'bg-red-50 border-red-500' 
          : 'bg-emerald-50 border-emerald-500'
      }`}>
        <div className={`p-3 rounded-full ${isLethal ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
          {isLethal ? <AlertTriangle size={32} /> : <CheckCircle size={32} />}
        </div>
        <div>
          <h2 className={`text-2xl font-bold ${isLethal ? 'text-red-700' : 'text-emerald-700'}`}>
            {isLethal ? 'POTENTIALLY LETHAL (具有殺傷力)' : 'NON-LETHAL (未達殺傷力標準)'}
          </h2>
          <p className="text-slate-600 mt-1">
            Max Unit Area Energy: <span className="font-mono font-bold">{stats.maxUnitEnergy.toFixed(2)} J/cm²</span> 
            (Threshold: {LETHALITY_THRESHOLD} J/cm²)
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Statistical Cards */}
        <div className="grid grid-cols-2 gap-4">
          <StatCard label="Mean Energy Density" value={stats.meanUnitEnergy.toFixed(2)} unit="J/cm²" />
          <StatCard label="Standard Deviation" value={stats.stdDevUnitEnergy.toFixed(3)} unit="" />
          <StatCard label="Mean Velocity" value={stats.meanVelocity.toFixed(1)} unit="m/s" />
          <StatCard label="95% CI (Upper)" value={stats.confidenceInterval95[1].toFixed(2)} unit="J/cm²" />
        </div>

        {/* Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-[300px]">
          <h3 className="text-sm font-semibold text-slate-500 mb-4 uppercase tracking-wider">Energy Density Distribution</h3>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} />
              <YAxis 
                yAxisId="left" 
                stroke="#64748b" 
                fontSize={12} 
                label={{ value: 'J/cm²', angle: -90, position: 'insideLeft', style: { fill: '#94a3b8' } }} 
                domain={[0, (dataMax: number) => Math.max(dataMax * 1.2, 25)]}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                cursor={{ fill: '#f1f5f9' }}
              />
              <ReferenceLine yAxisId="left" y={20} stroke="#ef4444" strokeDasharray="3 3" label={{ position: 'right', value: 'Threshold (20)', fill: '#ef4444', fontSize: 12 }} />
              <Bar yAxisId="left" dataKey="energy" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Unit Energy" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* AI Report Section */}
      <div className="bg-slate-900 text-slate-50 rounded-xl overflow-hidden shadow-xl">
        <div className="bg-slate-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-indigo-400">
            <BrainCircuit size={20} />
            <h3 className="font-bold tracking-wide">GEMINI FORENSIC EVALUATION</h3>
          </div>
          <span className="text-xs text-slate-400 font-mono uppercase">AI Generated • Gemini 3 Flash</span>
        </div>
        <div className="p-8 prose prose-invert prose-headings:text-indigo-300 prose-p:text-slate-300 max-w-none font-serif leading-relaxed">
          <ReactMarkdown>{aiReport}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, unit }: { label: string, value: string, unit: string }) => (
  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
    <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">{label}</p>
    <div className="flex items-baseline gap-1">
      <span className="text-2xl font-bold text-slate-900 font-mono">{value}</span>
      <span className="text-sm text-slate-400 font-medium">{unit}</span>
    </div>
  </div>
);