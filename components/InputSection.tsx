import React, { useState } from 'react';
import { ProjectileParams } from '../types';
import { Plus, Trash2, Gauge, Weight, Ruler } from 'lucide-react';

interface InputSectionProps {
  params: ProjectileParams;
  setParams: (p: ProjectileParams) => void;
  velocities: number[];
  setVelocities: (v: number[]) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
}

export const InputSection: React.FC<InputSectionProps> = ({
  params,
  setParams,
  velocities,
  setVelocities,
  onAnalyze,
  isAnalyzing
}) => {
  const [velocityInput, setVelocityInput] = useState<string>('');

  const handleAddVelocity = () => {
    const val = parseFloat(velocityInput);
    if (!isNaN(val) && val > 0) {
      setVelocities([...velocities, val]);
      setVelocityInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddVelocity();
    }
  };

  const removeVelocity = (index: number) => {
    setVelocities(velocities.filter((_, i) => i !== index));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
      {/* Parameters Panel */}
      <div className="lg:col-span-4 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <Ruler size={20} className="text-blue-600" />
          Test Parameters
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">
              Projectile Diameter (mm)
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                className="block w-full pl-3 pr-10 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={params.diameterMm}
                onChange={(e) => setParams({ ...params, diameterMm: parseFloat(e.target.value) || 0 })}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400 text-sm">
                mm
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">
              Projectile Weight (g)
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                className="block w-full pl-3 pr-10 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={params.weightGrams}
                onChange={(e) => setParams({ ...params, weightGrams: parseFloat(e.target.value) || 0 })}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400 text-sm">
                g
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-blue-50 p-4 rounded-lg border border-blue-100">
          <h4 className="text-sm font-semibold text-blue-900 mb-2">Calculated Sectional Area</h4>
          <p className="text-2xl font-mono text-blue-700">
            {(Math.PI * Math.pow((params.diameterMm / 20), 2)).toFixed(4)} <span className="text-sm text-blue-500">cm²</span>
          </p>
        </div>
      </div>

      {/* Data Entry Panel */}
      <div className="lg:col-span-8 bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col">
        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <Gauge size={20} className="text-blue-600" />
          Velocity Readings
        </h3>

        <div className="flex gap-2 mb-4">
          <div className="relative flex-grow">
             <input
              type="number"
              step="0.1"
              placeholder="Enter velocity (m/s)..."
              className="block w-full pl-4 pr-12 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={velocityInput}
              onChange={(e) => setVelocityInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400 font-mono text-sm">
              m/s
            </div>
          </div>
          <button
            onClick={handleAddVelocity}
            className="px-6 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 active:scale-95 transition-all flex items-center gap-2 font-medium"
          >
            <Plus size={18} />
            Add Shot
          </button>
        </div>

        <div className="flex-grow bg-slate-50 rounded-lg border border-slate-200 p-4 mb-4 overflow-y-auto max-h-[300px]">
          {velocities.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <Gauge size={48} className="mb-2 opacity-20" />
              <p>No velocity data recorded.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {velocities.map((v, idx) => (
                <div key={idx} className="flex justify-between items-center bg-white p-3 rounded border border-slate-200 shadow-sm animate-in fade-in zoom-in duration-200">
                  <span className="font-mono font-medium text-slate-700">#{idx + 1}</span>
                  <span className="font-mono font-bold text-slate-900">{v.toFixed(1)}</span>
                  <button onClick={() => removeVelocity(idx)} className="text-slate-400 hover:text-red-500 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-slate-100">
          <span className="text-slate-500 font-medium">{velocities.length} samples collected</span>
          <button
            onClick={onAnalyze}
            disabled={velocities.length === 0 || isAnalyzing}
            className={`px-8 py-3 rounded-lg font-bold text-white shadow-lg transition-all ${
              velocities.length === 0 || isAnalyzing
                ? 'bg-slate-300 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 hover:shadow-blue-500/25 active:scale-95'
            }`}
          >
            {isAnalyzing ? 'Processing...' : 'Run Analysis'}
          </button>
        </div>
      </div>
    </div>
  );
};