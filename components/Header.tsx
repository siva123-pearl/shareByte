
import React from 'react';

interface HeaderProps {
  currentView: string;
  setView: (view: string) => void;
  role: string;
}

const Header: React.FC<HeaderProps> = ({ currentView, setView, role }) => {
  return (
    <header className="sticky top-0 z-50 glass border-b border-emerald-100 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('landing')}>
        <div className="bg-emerald-500 p-2 rounded-xl text-white">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 21l-8.228-5.254A2 2 0 013 14.079V5a2 2 0 012-2h14a2 2 0 012 2v9.079a2 2 0 01-.772 1.667L12 21z" />
          </svg>
        </div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">ShareBite</h1>
      </div>
      
      <nav className="hidden md:flex items-center gap-6">
        <button 
          onClick={() => setView('landing')}
          className={`text-sm font-medium transition-colors ${currentView === 'landing' ? 'text-emerald-600' : 'text-slate-600 hover:text-emerald-500'}`}
        >
          Home
        </button>
        <button 
          onClick={() => setView('discover')}
          className={`text-sm font-medium transition-colors ${currentView === 'discover' ? 'text-emerald-600' : 'text-slate-600 hover:text-emerald-500'}`}
        >
          Discover
        </button>
        <button 
          onClick={() => setView('impact')}
          className={`text-sm font-medium transition-colors ${currentView === 'impact' ? 'text-emerald-600' : 'text-slate-600 hover:text-emerald-500'}`}
        >
          Our Impact
        </button>
      </nav>

      <div className="flex items-center gap-4">
        <button 
          onClick={() => setView('dashboard')}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-lg text-sm font-semibold transition-all shadow-lg shadow-emerald-200"
        >
          Dashboard
        </button>
        <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white overflow-hidden">
          <img src="https://picsum.photos/seed/user123/100/100" alt="Avatar" className="w-full h-full object-cover" />
        </div>
      </div>
    </header>
  );
};

export default Header;
