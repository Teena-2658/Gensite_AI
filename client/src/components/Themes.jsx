import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Palette, Type, ArrowRight, LayoutDashboard, CheckCircle2, Sparkles } from 'lucide-react';

const GOOGLE_FONTS = [
  "Inter", "Poppins", "Montserrat", "Roboto", "Open Sans", "Lato", "Playfair Display", 
  "Oswald", "Raleway", "Merriweather", "Noto Sans", "Ubuntu", "Lora", "PT Sans", 
  "Kanit", "Bebas Neue", "Titillium Web", "Quicksand", "Fira Sans", "Work Sans",
  "Pacifico", "Caveat", "Dancing Script", "Shadows Into Light", "Abril Fatface",
  "Righteous", "Lobster", "Comfortaa", "Orbitron", "Patua One", "Acme", "Alegreya",
  "Arvo", "Bitter", "Courgette", "Domine", "Exo 2", "Inconsolata", "Josefin Sans",
  "Karla", "Libre Baskerville", "Muli", "Nunito", "Old Standard TT", "Overpass",
  "Oxygen", "Questrial", "Saira", "Teko", "Varela Round"
];

// Trending Color Presets for users who don't know hex
const COLOR_PRESETS = [
  { primary: "#2563eb", secondary: "#f8fafc", label: "Modern Blue" },
  { primary: "#7c3aed", secondary: "#1e1b4b", label: "Deep Purple" },
  { primary: "#059669", secondary: "#f0fdf4", label: "Nature Green" },
  { primary: "#db2777", secondary: "#fdf2f8", label: "Soft Pink" },
  { primary: "#ea580c", secondary: "#fff7ed", label: "Sunset Orange" },
  { primary: "#0f172a", secondary: "#ffffff", label: "Classic Dark" },
];

const Themes = () => {
  const navigate = useNavigate();
  const [primaryColor, setPrimaryColor] = useState("#2563eb");
  const [secondaryColor, setSecondaryColor] = useState("#f8fafc");
  const [selectedFont, setSelectedFont] = useState("Inter");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredFonts = GOOGLE_FONTS.filter(f => f.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleApply = () => {
    navigate("/dashboard", { 
      state: { 
        selectedPrompt: `Generate a professional website. Typography: ${selectedFont}. Theme Colors: Primary ${primaryColor}, Secondary ${secondaryColor}. Style: Modern and Clean.`,
        focusSearch: true
      } 
    });
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] text-slate-900 font-sans p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-slate-900">Theme Designer</h1>
            <p className="text-slate-500 font-medium">Visual customization for your AI website.</p>
          </div>
          <button onClick={() => navigate("/dashboard")} className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl hover:shadow-md transition-all font-bold">
            <LayoutDashboard size={18} /> Dashboard
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* 1. VISUAL COLOR PICKER */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
              <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
                <Palette className="text-blue-600" /> 1. Pick Your Colors
              </h2>
              
              <div className="space-y-8">
                {/* Visual Primary Picker */}
                <div className="space-y-3">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400">Main Brand Color</label>
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-20 h-20 rounded-2xl cursor-pointer shadow-lg border-4 border-white ring-1 ring-slate-200 transition-transform hover:scale-105"
                      style={{ backgroundColor: primaryColor }}
                      onClick={() => document.getElementById('pColor').click()}
                    />
                    <div className="flex-1">
                      <button 
                        onClick={() => document.getElementById('pColor').click()}
                        className="w-full py-2 px-4 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm font-bold transition-colors"
                      >
                        Choose Color
                      </button>
                      <input type="color" id="pColor" value={primaryColor} onChange={(e)=>setPrimaryColor(e.target.value)} className="hidden" />
                    </div>
                  </div>
                </div>

                {/* Visual Secondary Picker */}
                <div className="space-y-3">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400">Background Tone</label>
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-20 h-20 rounded-2xl cursor-pointer shadow-lg border-4 border-white ring-1 ring-slate-200 transition-transform hover:scale-105"
                      style={{ backgroundColor: secondaryColor }}
                      onClick={() => document.getElementById('sColor').click()}
                    />
                    <div className="flex-1">
                      <button 
                        onClick={() => document.getElementById('sColor').click()}
                        className="w-full py-2 px-4 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm font-bold transition-colors"
                      >
                        Choose Tone
                      </button>
                      <input type="color" id="sColor" value={secondaryColor} onChange={(e)=>setSecondaryColor(e.target.value)} className="hidden" />
                    </div>
                  </div>
                </div>

                <hr className="border-slate-100" />

                {/* Presets */}
                <div className="space-y-3">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400">Quick Presets</label>
                  <div className="grid grid-cols-3 gap-3">
                    {COLOR_PRESETS.map((p, i) => (
                      <button 
                        key={i} 
                        onClick={() => { setPrimaryColor(p.primary); setSecondaryColor(p.secondary); }}
                        className="h-10 rounded-lg border border-slate-200 overflow-hidden flex transition-transform hover:scale-105"
                      >
                        <div className="w-1/2 h-full" style={{ backgroundColor: p.primary }} />
                        <div className="w-1/2 h-full" style={{ backgroundColor: p.secondary }} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. FONT SELECTOR */}
          <div className="lg:col-span-4 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col h-[600px]">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
              <Type className="text-purple-600" /> 2. Typography
            </h2>
            <input 
              type="text" placeholder="Search 50+ fonts..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl mb-4 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
            <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
              {filteredFonts.map((font) => (
                <div 
                  key={font} onClick={() => setSelectedFont(font)}
                  className={`p-4 rounded-xl cursor-pointer border-2 transition-all flex justify-between items-center ${selectedFont === font ? 'border-blue-500 bg-blue-50' : 'border-slate-50 hover:border-slate-200'}`}
                >
                  <span style={{ fontFamily: font }} className="text-lg">{font}</span>
                  {selectedFont === font && <CheckCircle2 size={16} className="text-blue-600" />}
                </div>
              ))}
            </div>
          </div>

          {/* 3. LIVE PREVIEW */}
          <div className="lg:col-span-4">
            <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl h-full flex flex-col sticky top-24">
              <h2 className="text-white text-lg font-bold mb-6 flex items-center gap-2 opacity-80">
                <Sparkles size={18} /> Live Preview
              </h2>
              
              <div 
                className="flex-1 rounded-3xl p-8 mb-8 transition-all duration-500 border-t-8 shadow-2xl"
                style={{ backgroundColor: secondaryColor, borderTopColor: primaryColor }}
              >
                <div className="flex justify-between items-center mb-10">
                   <div className="w-8 h-8 rounded-lg opacity-80" style={{ backgroundColor: primaryColor }} />
                   <div className="flex gap-2">
                      <div className="w-10 h-1 bg-slate-300 rounded-full" />
                      <div className="w-10 h-1 bg-slate-300 rounded-full" />
                   </div>
                </div>
                <h3 className="text-4xl font-black mb-4 leading-tight" style={{ fontFamily: selectedFont, color: primaryColor === secondaryColor ? '#000' : primaryColor }}>
                  Building the Future.
                </h3>
                <p className="text-base font-medium opacity-60 mb-8" style={{ fontFamily: selectedFont, color: '#475569' }}>
                  A clean preview of your selected typography and color palette.
                </p>
                <button 
                  className="px-8 py-3 rounded-xl font-black text-sm uppercase tracking-wider shadow-lg"
                  style={{ backgroundColor: primaryColor, color: '#fff' }}
                >
                  Get Started
                </button>
              </div>

              <button 
                onClick={handleApply}
                className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-xl flex items-center justify-center gap-3 transition-all active:scale-95"
              >
                Use This Theme <ArrowRight />
              </button>
            </div>
          </div>

        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        ${GOOGLE_FONTS.map(font => `@import url('https://fonts.googleapis.com/css2?family=${font.replace(/ /g, '+')}&display=swap');`).join('\n')}
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      `}} />
    </div>
  );
};

export default Themes;