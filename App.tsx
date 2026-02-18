
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import AIAssistant from './components/AIAssistant';
import ImpactStats from './components/ImpactStats';
import FoodVanTracker from './components/FoodVanTracker';
import { UserRole, FoodItem, FoodVan } from './types';
import { analyzeFoodImage, findDonationPlaces, suggestVanStops } from './services/geminiService';

const App: React.FC = () => {
  const [view, setView] = useState<string>('landing');
  const [role, setRole] = useState<UserRole>(UserRole.DONOR);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [nearbyPlaces, setNearbyPlaces] = useState<any[]>([]);
  const [isFindingPlaces, setIsFindingPlaces] = useState(false);
  
  const [activeVan, setActiveVan] = useState<FoodVan>({
    id: 'FLEET-P1',
    name: 'ShareBite Mobile Unit-1',
    currentLocation: { lat: 40.7128, lng: -74.0060, address: 'Initializing travel sequence...' },
    status: 'traveling',
    lastUpdated: new Date().toISOString()
  });
  const [suggestedStops, setSuggestedStops] = useState<any[]>([]);
  const [isSuggestingStops, setIsSuggestingStops] = useState(false);

  const [foodItems, setFoodItems] = useState<FoodItem[]>([
    {
      id: '1',
      name: 'Fresh Bakery Surplus',
      category: 'Bakery',
      quantity: '15 units',
      expiryDate: '2023-11-15',
      description: 'Hand-crafted bakery surplus from morning production.',
      donorId: 'd1',
      status: 'available',
      location: { lat: 40.7128, lng: -74.0060, address: 'Greenwich Village' },
      imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=400'
    }
  ]);

  const [isUploading, setIsUploading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const newLoc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserLocation(newLoc);
          setActiveVan(prev => ({
            ...prev,
            currentLocation: { ...prev.currentLocation, lat: newLoc.lat, lng: newLoc.lng, address: 'Live Travel Corridor' },
            lastUpdated: new Date().toISOString()
          }));
        },
        (err) => console.warn('Location tracking active', err),
        { enableHighAccuracy: true, timeout: 5000 }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  const handleSuggestStops = async () => {
    if (!userLocation) return;
    setIsSuggestingStops(true);
    try {
      const stops = await suggestVanStops(userLocation.lat, userLocation.lng);
      setSuggestedStops(stops);
    } catch (e) { console.error(e); } finally { setIsSuggestingStops(false); }
  };

  const handleFindNearby = async () => {
    if (!userLocation) { alert("Location required"); return; }
    setIsFindingPlaces(true);
    try {
      const places = await findDonationPlaces(userLocation.lat, userLocation.lng);
      setNearbyPlaces(places);
    } catch (e) { console.error(e); } finally { setIsFindingPlaces(false); }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(',')[1];
      const result = await analyzeFoodImage(base64);
      setAnalysisResult(result);
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const renderLanding = () => (
    <div className="space-y-32 pb-24 overflow-hidden">
      {/* Hero Section */}
      <section className="text-center max-w-6xl mx-auto px-6 pt-24 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -z-10 w-[800px] h-[800px] bg-emerald-50 rounded-full blur-[120px] opacity-60 animate-pulse-slow"></div>
        
        <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-md text-emerald-700 text-[10px] font-black px-5 py-2 rounded-full uppercase tracking-[0.2em] mb-12 border border-emerald-100 shadow-sm animate-in fade-in slide-in-from-top-4 duration-1000">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
          Decentralized Food Network Protocol
        </div>

        <h2 className="text-7xl md:text-9xl font-black text-slate-900 leading-[0.85] mb-12 tracking-tighter animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
          Zero waste. <br/><span className="text-gradient">Human impact.</span>
        </h2>
        
        <p className="text-xl md:text-2xl text-slate-500 mb-14 max-w-3xl mx-auto leading-relaxed font-medium animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
          ShareBite uses Gemini AI to verify food safety and route mobile donation units in real-time. Connect surplus with need, instantly.
        </p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
          <button 
            onClick={() => setView('dashboard')} 
            className="group relative bg-slate-900 text-white px-12 py-6 rounded-[2.5rem] font-black transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-slate-200 overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-3">
              Explore Dashboard
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 7l5 5m0 0l-5 5m5-5H6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </span>
            <div className="absolute inset-0 bg-emerald-600 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
          </button>
          
          <button 
            onClick={() => setView('impact')} 
            className="bg-white/80 backdrop-blur-md border-2 border-slate-100 text-slate-900 px-12 py-6 rounded-[2.5rem] font-black transition-all hover:bg-white hover:border-emerald-200 hover:scale-105 active:scale-95"
          >
            Live Impact Data
          </button>
        </div>
      </section>

      {/* Real-time Telemetry Visual Section */}
      <section className="max-w-7xl mx-auto px-6 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="relative animate-float">
            <div className="absolute -inset-4 bg-emerald-500/20 rounded-[3.5rem] blur-2xl -z-10"></div>
            <div className="rounded-[3rem] overflow-hidden shadow-2xl border-[16px] border-white glass">
              <img 
                src="https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&q=80&w=1200" 
                alt="Mobile Donation Unit" 
                className="w-full h-[500px] object-cover opacity-90"
              />
              <div className="absolute bottom-10 left-10 right-10 p-6 glass rounded-3xl shadow-2xl border border-white/50 animate-in fade-in zoom-in duration-1000 delay-700">
                 <div className="flex items-center gap-4 mb-4">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full animate-ping"></div>
                    <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Active Live Unit: Manhattan P-01</span>
                 </div>
                 <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 w-[65%] rounded-full animate-pulse"></div>
                 </div>
              </div>
            </div>
          </div>

          <div className="space-y-10 lg:pl-12">
            <h3 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">
              Technology that <br/><span className="text-emerald-500 italic">feeds the world.</span>
            </h3>
            
            <div className="space-y-8">
              {[
                { title: 'AI Verification', desc: 'Gemini 3 Flash analyzes surplus photos to ensure safety and quality standards.', icon: '⚡' },
                { title: 'Live Mapping', desc: 'Real-time telemetry routes mobile vans to your exact coordinates instantly.', icon: '📍' },
                { title: 'Dynamic Impact', desc: 'Decentralized ledger tracks every calorie saved and meal shared.', icon: '📊' }
              ].map((pill, idx) => (
                <div key={idx} className="flex gap-6 group hover:translate-x-2 transition-transform duration-300">
                  <div className="flex-shrink-0 w-14 h-14 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center text-2xl group-hover:scale-110 group-hover:bg-emerald-50 transition-all">
                    {pill.icon}
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-slate-900 mb-1">{pill.title}</h4>
                    <p className="text-slate-500 font-medium text-sm leading-relaxed">{pill.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How it Works - Vertical Steps */}
      <section className="bg-slate-900 py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h3 className="text-3xl md:text-5xl font-black text-white mb-6">How the Protocol works.</h3>
            <p className="text-slate-400 font-medium max-w-xl mx-auto">Three steps to turn surplus into a shared meal.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { step: '01', title: 'Snap surplus', desc: 'Take a photo of any food surplus. Our AI categorizes it instantly.', icon: '📸' },
              { step: '02', title: 'Live Sync', desc: 'Our mobile units or nearby centers receive a live location alert.', icon: '📡' },
              { step: '03', title: 'Real Impact', desc: 'Food is picked up within 60 minutes and distributed locally.', icon: '🌍' }
            ].map((item, idx) => (
              <div key={idx} className="relative group">
                <div className="absolute -top-10 -left-6 text-7xl font-black text-white/[0.03] group-hover:text-emerald-500/10 transition-colors">{item.step}</div>
                <div className="p-10 rounded-[3rem] bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-all duration-500">
                  <div className="text-4xl mb-6">{item.icon}</div>
                  <h4 className="text-xl font-black text-white mb-3">{item.title}</h4>
                  <p className="text-slate-400 text-sm leading-relaxed font-medium">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Community Quote */}
      <section className="max-w-4xl mx-auto px-6 text-center">
        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-10">
          <svg className="w-10 h-10 text-emerald-500" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C19.5693 16 20.017 15.5523 20.017 15V9C20.017 8.44772 19.5693 8 19.017 8H15.017C14.4647 8 14.017 8.44772 14.017 9V11H12.017V9C12.017 7.34315 13.3601 6 15.017 6H19.017C20.6739 6 22.017 7.34315 22.017 9V15C22.017 16.6569 20.6739 18 19.017 18H16.017V21H14.017ZM4.017 21L4.017 18C4.017 16.8954 4.9124 16 6.017 16H9.017C9.5693 16 10.017 15.5523 10.017 15V9C10.017 8.44772 9.5693 8 9.017 8H5.017C4.4647 8 4.017 8.44772 4.017 9V11H2.017V9C2.017 7.34315 3.3601 6 5.017 6H9.017C10.6739 6 12.017 7.34315 12.017 9V15C12.017 16.6569 10.6739 18 9.017 18H6.017V21H4.017Z"/></svg>
        </div>
        <p className="text-3xl font-black text-slate-900 leading-tight mb-8">
          "ShareBite transformed our surplus bread from a waste problem into 200 meals for our local shelter every single week."
        </p>
        <p className="text-emerald-600 font-black uppercase tracking-widest text-xs">Anya K. • Artisan Bakery NYC</p>
      </section>
    </div>
  );

  const renderDashboard = () => (
    <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-3 gap-12">
      <div className="lg:col-span-2 space-y-12">
        <FoodVanTracker van={activeVan} suggestedStops={suggestedStops} onRefreshStops={handleSuggestStops} isLoading={isSuggestingStops} />
        <section className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Nearby Centers</h2>
              <p className="text-slate-500 font-medium">Physical donation points verified in your live area.</p>
            </div>
            <button onClick={handleFindNearby} disabled={isFindingPlaces} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold transition-all flex items-center gap-3 hover:bg-slate-800 disabled:opacity-50">
              {isFindingPlaces ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" strokeWidth="2"/><circle cx="12" cy="11" r="3" strokeWidth="2"/></svg>}
              Sync Locations
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {nearbyPlaces.map((place, idx) => (
              <div key={idx} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
                <div className="bg-emerald-50 text-emerald-600 w-12 h-12 rounded-2xl flex items-center justify-center mb-6">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" strokeWidth="2"/></svg>
                </div>
                <h4 className="text-xl font-black text-slate-900 mb-2 truncate">{place.name}</h4>
                <a href={place.uri} target="_blank" className="inline-flex items-center gap-2 text-emerald-600 font-black text-xs uppercase tracking-widest hover:text-emerald-700">Get Directions <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeWidth="2.5"/></svg></a>
              </div>
            ))}
          </div>
        </section>
      </div>
      <aside className="space-y-8">
        <div className="bg-white p-10 rounded-[2.5rem] border border-emerald-100 shadow-2xl relative overflow-hidden">
          <h3 className="text-2xl font-black text-slate-900 mb-4">AI Intake</h3>
          <p className="text-slate-500 text-sm font-medium mb-8">Scan surplus items to optimize mobile van collection.</p>
          <label className="block w-full cursor-pointer group">
            <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
            <div className={`border-[3px] border-dashed rounded-[2rem] p-10 text-center transition-all ${isUploading ? 'bg-emerald-50 border-emerald-300' : 'bg-slate-50 border-slate-100 group-hover:bg-emerald-50 group-hover:border-emerald-200'}`}>
              {isUploading ? <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div> : <div className="bg-white w-16 h-16 rounded-2xl shadow-md mx-auto mb-6 flex items-center justify-center transition-transform group-hover:scale-110"><svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" strokeWidth="2.5"/><circle cx="12" cy="13" r="3" strokeWidth="2.5"/></svg></div>}
              <span className="block font-black text-slate-900 mb-1">Optical Entry</span>
            </div>
          </label>
          {analysisResult && (
            <div className="mt-8 p-6 bg-slate-50 rounded-[2rem] border border-slate-100 animate-in fade-in slide-in-from-bottom-4">
              <h4 className="font-black text-slate-900 text-xl mb-1">{analysisResult.name}</h4>
              <p className="text-emerald-600 font-bold text-sm mb-4">{analysisResult.category} • {analysisResult.quantity}</p>
              <button className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black text-sm shadow-xl hover:bg-emerald-500 transition-all active:scale-95">Summon Unit</button>
            </div>
          )}
        </div>
      </aside>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col selection:bg-emerald-100 selection:text-emerald-900">
      <Header currentView={view} setView={setView} role={role} />
      
      <main className="flex-1">
        {view === 'landing' ? renderLanding() : view === 'dashboard' ? renderDashboard() : (
          <div className="max-w-5xl mx-auto px-6 py-20"><ImpactStats /></div>
        )}
      </main>

      {/* Floating Action Button */}
      <button 
        onClick={() => setIsAssistantOpen(!isAssistantOpen)} 
        className="fixed bottom-10 right-10 z-[60] bg-slate-900 w-20 h-20 rounded-[2rem] flex items-center justify-center text-white shadow-2xl hover:scale-110 active:scale-95 transition-all shadow-slate-300 group"
      >
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-4 border-white animate-pulse"></div>
        <svg className={`w-10 h-10 transition-transform duration-500 ${isAssistantOpen ? 'rotate-90' : 'group-hover:scale-110'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {isAssistantOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />}
        </svg>
      </button>

      {/* AI Assistant Drawer */}
      <div className={`fixed bottom-36 right-10 z-[60] w-[380px] md:w-[420px] h-[600px] transition-all duration-700 transform ${isAssistantOpen ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-20 opacity-0 scale-90 pointer-events-none'}`}>
        <AIAssistant />
      </div>

      <footer className="border-t border-slate-100 py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="bg-emerald-500 p-3 rounded-2xl">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 21l-8.228-5.254A2 2 0 013 14.079V5a2 2 0 012-2h14a2 2 0 012 2v9.079a2 2 0 01-.772 1.667L12 21z" />
                </svg>
              </div>
              <span className="text-3xl font-black text-slate-900 tracking-tighter">ShareBite</span>
            </div>
            <p className="text-slate-400 font-medium max-w-sm leading-relaxed">The global protocol for decentralized food distribution. Powered by Gemini AI Intelligence.</p>
          </div>
          <div className="flex flex-col md:items-end gap-6 text-xs font-black uppercase tracking-widest text-slate-400">
            <div className="flex gap-8">
              <a href="#" className="hover:text-emerald-500 transition-colors">Safety Code</a>
              <a href="#" className="hover:text-emerald-500 transition-colors">Privacy</a>
              <a href="#" className="hover:text-emerald-500 transition-colors">Partner API</a>
            </div>
            <p className="opacity-60">© 2024 Protocol Verified • Live Node v4.2</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
