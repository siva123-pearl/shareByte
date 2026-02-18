
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

  return (
    <div className="min-h-screen flex flex-col selection:bg-emerald-100 selection:text-emerald-900">
      <Header currentView={view} setView={setView} role={role} />
      
      <main className="flex-1">
        {view === 'landing' ? (
          <div className="space-y-32 pb-24">
            <section className="text-center max-w-5xl mx-auto px-6 pt-24 animate-in fade-in duration-700">
              <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-widest mb-10 border border-emerald-100">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                Location Network Protocol Active
              </div>
              <h2 className="text-7xl md:text-9xl font-black text-slate-900 leading-[0.85] mb-12 tracking-tighter">
                Share food. <br/><span className="text-emerald-500">Live impact.</span>
              </h2>
              <p className="text-xl text-slate-500 mb-14 max-w-2xl mx-auto leading-relaxed">Bridging the gap between waste and community needs with mobile donation infrastructure and real-time AI tracking.</p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <button onClick={() => setView('dashboard')} className="bg-emerald-600 hover:bg-emerald-500 text-white px-10 py-5 rounded-[2rem] font-black transition-all shadow-2xl active:scale-95">Enter Dashboard</button>
                <button onClick={() => setView('impact')} className="bg-white border-2 border-slate-100 text-slate-900 px-10 py-5 rounded-[2rem] font-black transition-all active:scale-95">Our Impact</button>
              </div>
            </section>
          </div>
        ) : view === 'dashboard' ? (
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
                    <div key={idx} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
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
                <label className="block w-full cursor-pointer group">
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                  <div className={`border-[3px] border-dashed rounded-[2rem] p-10 text-center transition-all ${isUploading ? 'bg-emerald-50 border-emerald-300' : 'bg-slate-50 border-slate-100 group-hover:bg-emerald-50 group-hover:border-emerald-200'}`}>
                    {isUploading ? <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div> : <div className="bg-white w-16 h-16 rounded-2xl shadow-md mx-auto mb-6 flex items-center justify-center transition-transform group-hover:scale-110"><svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" strokeWidth="2.5"/><circle cx="12" cy="13" r="3" strokeWidth="2.5"/></svg></div>}
                    <span className="block font-black text-slate-900 mb-1">Verify Surplus</span>
                  </div>
                </label>
                {analysisResult && (
                  <div className="mt-8 p-6 bg-slate-50 rounded-[2rem] border border-slate-100 animate-in fade-in slide-in-from-bottom-4">
                    <h4 className="font-black text-slate-900 text-xl mb-1">{analysisResult.name}</h4>
                    <p className="text-emerald-600 font-bold text-sm mb-4">{analysisResult.category} • {analysisResult.quantity}</p>
                    <button className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black text-sm shadow-xl hover:bg-emerald-500 transition-all">Summon Unit</button>
                  </div>
                )}
              </div>
            </aside>
          </div>
        ) : (
          <div className="max-w-5xl mx-auto px-6 py-20"><ImpactStats /></div>
        )}
      </main>

      <button onClick={() => setIsAssistantOpen(!isAssistantOpen)} className="fixed bottom-10 right-10 z-[60] bg-slate-900 w-20 h-20 rounded-[2rem] flex items-center justify-center text-white shadow-2xl hover:scale-110 transition-all">
        <svg className={`w-10 h-10 transition-transform duration-500 ${isAssistantOpen ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {isAssistantOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />}
        </svg>
      </button>

      <div className={`fixed bottom-36 right-10 z-[60] w-[380px] md:w-[420px] h-[600px] transition-all duration-700 transform ${isAssistantOpen ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-20 opacity-0 scale-90 pointer-events-none'}`}>
        <AIAssistant />
      </div>

      <footer className="border-t border-slate-100 py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="flex items-center gap-4"><div className="bg-emerald-500 p-3 rounded-2xl"><svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 21l-8.228-5.254A2 2 0 013 14.079V5a2 2 0 012-2h14a2 2 0 012 2v9.079a2 2 0 01-.772 1.667L12 21z" strokeWidth="2.5"/></svg></div><span className="text-3xl font-black text-slate-900 tracking-tighter">ShareBite</span></div>
          <div className="flex flex-col md:items-end gap-4 text-xs font-black uppercase tracking-widest text-slate-400"><p>© 2024 Protocol Verified</p></div>
        </div>
      </footer>
    </div>
  );
};

export default App;
