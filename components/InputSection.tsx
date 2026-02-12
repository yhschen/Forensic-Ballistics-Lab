import React, { useState } from 'react';
import { ProjectileParams, ShotInput } from '../types';
import { Plus, Trash2, Gauge, Ruler, Weight, Archive } from 'lucide-react';

interface InputSectionProps {
  params: ProjectileParams;
  setParams: (p: ProjectileParams) => void;
  shots: ShotInput[];
  setShots: (s: ShotInput[]) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
}

export const InputSection: React.FC<InputSectionProps> = ({
  params,
  setParams,
  shots,
  setShots,
  onAnalyze,
  isAnalyzing
}) => {
  const [velocityInput, setVelocityInput] = useState<string>('');

  const handleAddShot = () => {
    const vel = parseFloat(velocityInput);
    if (!isNaN(vel) && vel > 0 && params.diameterMm > 0 && params.weightGrams > 0) {
      const newShot: ShotInput = {
        uuid: Date.now().toString() + Math.random().toString(),
        velocity: vel,
        diameterMm: params.diameterMm,
        weightGrams: params.weightGrams
      };
      setShots([...shots, newShot]);
      setVelocityInput('');
      // We keep the params populated as they might be similar.
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddShot();
    }
  };

  const removeShot = (uuid: string) => {
    setShots(shots.filter((s) => s.uuid !== uuid));
  };

  const clearAll = () => {
    if (confirm('Are you sure you want to clear all data?')) {
      setShots([]);
    }
  };

  return (
    <div className="space-y-6 mb-8">
      {/* Input Card */}
      <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
          <Plus className="text-blue-600" size={20} />
          Input Test Data
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
          {/* Diameter Input */}
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-2 flex items-center gap-2">
              <Ruler size={16} /> Diameter (mm)
            </label>
            <input
              type="number"
              step="0.01"
              placeholder="6.00"
              className="block w-full px-3 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50 transition-colors"
              value={params.diameterMm || ''}
              onChange={(e) => setParams({ ...params, diameterMm: parseFloat(e.target.value) || 0 })}
            />
          </div>

          {/* Weight Input */}
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-2 flex items-center gap-2">
              <Weight size={16} /> Weight (g)
            </label>
            <input
              type="number"
              step="0.01"
              placeholder="0.20"
              className="block w-full px-3 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50 transition-colors"
              value={params.weightGrams || ''}
              onChange={(e) => setParams({ ...params, weightGrams: parseFloat(e.target.value) || 0 })}
            />
          </div>

          {/* Velocity Input */}
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-2 flex items-center gap-2">
              <Gauge size={16} /> Velocity (m/s)
            </label>
            <input
              type="number"
              step="0.1"
              placeholder="120.5"
              className="block w-full px-3 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors"
              value={velocityInput}
              onChange={(e) => setVelocityInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>

          {/* Add Button */}
          <div>
            <button
              onClick={handleAddShot}
              className="w-full py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 active:scale-95 transition-all flex items-center justify-center gap-2 font-medium shadow-sm"
            >
              <Plus size={18} />
              Add Reading
            </button>
          </div>
        </div>
      </div>

      {/* List Card */}
      <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200 flex flex-col min-h-[300px]">
        <div className="flex justify-between items-center mb-4">
           <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Archive className="text-blue-600" size={20} />
            Recorded Shots
            <span className="text-sm font-normal text-slate-500 ml-2 bg-slate-100 px-2 py-1 rounded-full">{shots.length}</span>
          </h3>
          {shots.length > 0 && (
             <button onClick={clearAll} className="text-xs text-red-500 hover:text-red-700 underline decoration-red-200">
               Clear All
             </button>
           )}
        </div>

        <div className="flex-grow bg-slate-50 rounded-lg border border-slate-200 p-4 mb-4 overflow-y-auto max-h-[400px]">
          {shots.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 py-12">
              <Gauge size={48} className="mb-2 opacity-20" />
              <p>No velocity data recorded.</p>
              <p className="text-xs mt-1">Enter parameters above and click Add Reading.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {shots.map((s, idx) => (
                <div key={s.uuid} className="flex justify-between items-center bg-white p-3 rounded-lg border border-slate-200 shadow-sm animate-in fade-in zoom-in duration-200 hover:border-blue-200 transition-colors">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-500 text-xs font-mono font-bold">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="font-mono font-bold text-slate-900 text-lg leading-none">
                        {s.velocity.toFixed(2)} <span className="text-xs font-sans font-normal text-slate-400">m/s</span>
                      </div>
                    </div>
                    <div className="h-8 w-px bg-slate-100 mx-2"></div>
                    <div className="flex gap-4 text-xs text-slate-500 font-mono">
                         <div className="flex flex-col">
                            <span className="text-[10px] text-slate-400 uppercase">Mass</span>
                            <span className="font-bold text-slate-700">{s.weightGrams}g</span>
                         </div>
                         <div className="flex flex-col">
                            <span className="text-[10px] text-slate-400 uppercase">Dia</span>
                            <span className="font-bold text-slate-700">{s.diameterMm}mm</span>
                         </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => removeShot(s.uuid)} 
                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-all"
                    title="Remove shot"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-100">
          <button
            onClick={onAnalyze}
            disabled={shots.length === 0 || isAnalyzing}
            className={`px-8 py-3 rounded-lg font-bold text-white shadow-lg transition-all ${
              shots.length === 0 || isAnalyzing
                ? 'bg-slate-300 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 hover:shadow-blue-500/25 active:scale-95'
            }`}
          >
            {isAnalyzing ? 'Processing...' : 'Run Forensic Analysis'}
          </button>
        </div>
      </div>
    </div>
  );
};