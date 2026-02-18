
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const data = [
  { name: 'Jan', tons: 1.2 },
  { name: 'Feb', tons: 1.8 },
  { name: 'Mar', tons: 2.1 },
  { name: 'Apr', tons: 2.5 },
  { name: 'May', tons: 3.2 },
  { name: 'Jun', tons: 2.8 },
];

const ImpactStats: React.FC = () => {
  return (
    <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200 border border-slate-100">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900">Environmental Impact</h2>
        <p className="text-slate-500 text-sm">Monthly food waste diverted from landfills (in tons)</p>
      </div>
      
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748b', fontSize: 12 }} 
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748b', fontSize: 12 }} 
            />
            <Tooltip 
              cursor={{ fill: '#f8fafc' }}
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
            />
            <Bar dataKey="tons" radius={[4, 4, 4, 4]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={index === data.length - 1 ? '#10b981' : '#94a3b8'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        {[
          { label: 'Meals Provided', value: '42,850', icon: '🍲', color: 'emerald' },
          { label: 'Donors Active', value: '1,240', icon: '🏢', color: 'blue' },
          { label: 'CO2 Saved', value: '15.4t', icon: '🌱', color: 'emerald' }
        ].map((stat, idx) => (
          <div key={idx} className="bg-slate-50 p-4 rounded-2xl flex items-center gap-4">
            <div className="text-3xl">{stat.icon}</div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{stat.label}</p>
              <p className="text-xl font-bold text-slate-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImpactStats;
