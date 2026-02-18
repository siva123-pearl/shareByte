
import React from 'react';
import { FoodVan } from '../types';

interface FoodVanTrackerProps {
  van: FoodVan;
  suggestedStops: any[];
  onRefreshStops: () => void;
  isLoading: boolean;
}

const FoodVanTracker: React.FC<FoodVanTrackerProps> = ({ van, suggestedStops, onRefreshStops, isLoading }) => {
  return (
    <div className="bg-slate-950 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden border border-slate-800 transition-all duration-700">
      {/* Visual Telemetry Background */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] -mr-48 -mt-48 animate-pulse"></div>
      
      <div className="relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="bg-emerald-500 p-4 rounded-2xl shadow-lg shadow-emerald-500/40 relative z-10">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="absolute inset-0 bg-emerald-500 rounded-2xl animate-ping opacity-20"></div>
            </div>
            <div>
              <h3 className="text-2xl font-black tracking-tight text-white">{van.name}</h3>
              <div className="flex items-center gap-3 mt-1">
                <span className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce"></span>
                </span>
                <span className="text-[10px] text-emerald-400 font-black uppercase tracking-[0.2em]">Travel Sync Live</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-8 items-center bg-slate-900/50 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/5">
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Status</p>
              <p className="text-xs font-black text-emerald-400 uppercase tracking-wider">{van.status}</p>
            </div>
            <div className="w-px h-8 bg-slate-800"></div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Telemetry</p>
              <p className="text-xs font-mono text-slate-300">
                {van.currentLocation.lat.toFixed(4)}, {van.currentLocation.lng.toFixed(4)}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-white/[0.03] border border-white/10 rounded-[2rem] p-8 relative group overflow-hidden">
              <div className="absolute inset-0 opacity-10 pointer-events-none">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <path d="M10,10 L90,10 L90,90 L10,90 Z" fill="none" stroke="currentColor" strokeWidth="0.1" strokeDasharray="1 1" />
                  <path d="M0,50 L100,50 M50,0 L50,100" stroke="currentColor" strokeWidth="0.05" />
                  <circle cx="50" cy="50" r="1.5" className="fill-emerald-500 animate-pulse" />
                </svg>
              </div>
              <div className="relative z-10">
                <p className="text-[10px] text-emerald-500 mb-3 uppercase font-black tracking-widest">Active Corridor</p>
                <p className="text-xl font-medium text-white leading-tight mb-8 truncate">
                  {van.currentLocation.address}
                </p>
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 w-3/4 rounded-full animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.4)]"></div>
                  </div>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Intake Capacity</span>
                </div>
              </div>
            </div>
            <button 
              onClick={onRefreshStops}
              disabled={isLoading}
              className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white py-5 rounded-2xl font-black transition-all shadow-2xl shadow-emerald-900/30 flex items-center justify-center gap-4 active:scale-95"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              )}
              {isLoading ? 'CALCULATING...' : 'OPTIMIZE NEXT STOP'}
            </button>
          </div>
          <div className="bg-slate-900/50 rounded-[2rem] border border-white/5 p-8">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-8">Route Optimization Hub</h4>
            <div className="space-y-4">
              {suggestedStops.length > 0 ? suggestedStops.map((stop, i) => (
                <div key={i} className="flex items-center justify-between bg-white/[0.02] hover:bg-white/[0.06] p-5 rounded-2xl transition-all group border border-transparent hover:border-emerald-500/20">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/5 flex items-center justify-center text-emerald-400 font-black text-sm border border-emerald-500/10 group-hover:bg-emerald-500/10 transition-colors">0{i + 1}</div>
                    <div>
                      <p className="text-base font-black text-slate-100 group-hover:text-emerald-400 transition-colors">{stop.name}</p>
                      <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">Predicted Intake: High</p>
                    </div>
                  </div>
                  <a href={stop.uri} target="_blank" rel="noopener noreferrer" className="p-3 text-slate-600 hover:text-emerald-400 transition-all">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </a>
                </div>
              )) : (
                <div className="flex flex-col items-center justify-center py-16 opacity-20">
                  <p className="text-xs font-black uppercase tracking-[0.2em] mb-2">Awaiting Geo-Simulation...</p>
                  <p className="text-[9px] text-slate-600 font-medium">Telemetry must be active to calculate stops.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoodVanTracker;
