
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Palette,
  Type,
  ArrowRight,
  LayoutDashboard,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

const GOOGLE_FONTS = [
  "Inter","Poppins","Montserrat","Roboto","Open Sans","Lato","Playfair Display",
  "Oswald","Raleway","Merriweather","Noto Sans","Ubuntu","Lora","PT Sans",
  "Kanit","Bebas Neue","Titillium Web","Quicksand","Fira Sans","Work Sans",
  "Pacifico","Caveat","Dancing Script","Shadows Into Light","Abril Fatface",
  "Righteous","Lobster","Comfortaa","Orbitron","Patua One","Acme","Alegreya",
  "Arvo","Bitter","Courgette","Domine","Exo 2","Inconsolata","Josefin Sans",
  "Karla","Libre Baskerville","Muli","Nunito","Old Standard TT","Overpass",
  "Oxygen","Questrial","Saira","Teko","Varela Round"
];

const COLOR_PRESETS = [
  { primary: "#2563eb", secondary: "#020617" },
  { primary: "#7c3aed", secondary: "#0f172a" },
  { primary: "#059669", secondary: "#020617" },
  { primary: "#db2777", secondary: "#020617" },
  { primary: "#ea580c", secondary: "#020617" },
  { primary: "#38bdf8", secondary: "#020617" }
];

const Themes = () => {
  const navigate = useNavigate();

  const [primaryColor, setPrimaryColor] = useState("#2563eb");
  const [secondaryColor, setSecondaryColor] = useState("#020617");
  const [selectedFont, setSelectedFont] = useState("Inter");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredFonts = GOOGLE_FONTS.filter((f) =>
    f.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleApply = () => {
    navigate("/dashboard", {
      state: {
        selectedPrompt: `Generate a professional website. Typography: ${selectedFont}. Theme Colors: Primary ${primaryColor}, Secondary ${secondaryColor}. Style: Modern and Clean.`,
        focusSearch: true,
      },
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#050816] via-[#0a1125] to-[#050816] text-white font-sans p-6 md:p-10">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-black tracking-tight">
              Theme Designer
            </h1>
            <p className="text-slate-400 font-medium">
              Visual customization for your AI website.
            </p>
          </div>

          <button
            onClick={() => navigate("/dashboard")}
            className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-[#0f172a] border border-slate-700 rounded-xl hover:bg-[#1e293b] transition-all font-bold"
          >
            <LayoutDashboard size={18} className="text-blue-400" />
            Dashboard
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* COLOR PICKER */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-[#0f172a] p-8 rounded-[2.5rem] border border-slate-700 shadow-xl">
              <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
                <Palette className="text-blue-400" /> Pick Colors
              </h2>

              <div className="space-y-8">

                {/* PRIMARY */}
                <div>
                  <label className="text-xs uppercase tracking-widest text-slate-400 font-bold">
                    Primary Color
                  </label>

                  <div className="flex items-center gap-4 mt-3">
                    <div
                      className="w-20 h-20 rounded-2xl cursor-pointer shadow-lg border-2 border-slate-700"
                      style={{ backgroundColor: primaryColor }}
                      onClick={() => document.getElementById("pColor").click()}
                    />

                    <button
                      onClick={() =>
                        document.getElementById("pColor").click()
                      }
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl font-bold text-sm"
                    >
                      Choose
                    </button>

                    <input
                      type="color"
                      id="pColor"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="hidden"
                    />
                  </div>
                </div>

                {/* SECONDARY */}
                <div>
                  <label className="text-xs uppercase tracking-widest text-slate-400 font-bold">
                    Background Color
                  </label>

                  <div className="flex items-center gap-4 mt-3">
                    <div
                      className="w-20 h-20 rounded-2xl cursor-pointer shadow-lg border-2 border-slate-700"
                      style={{ backgroundColor: secondaryColor }}
                      onClick={() => document.getElementById("sColor").click()}
                    />

                    <button
                      onClick={() =>
                        document.getElementById("sColor").click()
                      }
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl font-bold text-sm"
                    >
                      Choose
                    </button>

                    <input
                      type="color"
                      id="sColor"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="hidden"
                    />
                  </div>
                </div>

                {/* PRESETS */}
                <div>
                  <label className="text-xs uppercase tracking-widest text-slate-400 font-bold">
                    Quick Presets
                  </label>

                  <div className="grid grid-cols-3 gap-3 mt-3">
                    {COLOR_PRESETS.map((p, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setPrimaryColor(p.primary);
                          setSecondaryColor(p.secondary);
                        }}
                        className="h-10 rounded-lg border border-slate-700 overflow-hidden flex hover:scale-105 transition"
                      >
                        <div
                          className="w-1/2"
                          style={{ backgroundColor: p.primary }}
                        />
                        <div
                          className="w-1/2"
                          style={{ backgroundColor: p.secondary }}
                        />
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* FONT SELECTOR */}
          <div className="lg:col-span-4 bg-[#0f172a] p-8 rounded-[2.5rem] border border-slate-700 shadow-xl flex flex-col h-[600px]">

            <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
              <Type className="text-purple-400" /> Typography
            </h2>

            <input
              type="text"
              placeholder="Search fonts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-4 bg-[#020617] border border-slate-700 rounded-2xl mb-4 outline-none focus:ring-2 focus:ring-blue-500"
            />

            <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">

              {filteredFonts.map((font) => (
                <div
                  key={font}
                  onClick={() => setSelectedFont(font)}
                  className={`p-4 rounded-xl cursor-pointer border transition flex justify-between items-center ${
                    selectedFont === font
                      ? "border-blue-500 bg-blue-500/10"
                      : "border-slate-800 hover:border-slate-600"
                  }`}
                >
                  <span style={{ fontFamily: font }} className="text-lg">
                    {font}
                  </span>

                  {selectedFont === font && (
                    <CheckCircle2 size={16} className="text-blue-400" />
                  )}
                </div>
              ))}

            </div>
          </div>

          {/* LIVE PREVIEW */}
          <div className="lg:col-span-4">
            <div className="bg-[#020617] p-8 rounded-[2.5rem] shadow-2xl h-full flex flex-col sticky top-24">

              <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-slate-300">
                <Sparkles size={18} /> Live Preview
              </h2>

              <div
                className="flex-1 rounded-3xl p-8 mb-8 transition border-t-8 shadow-xl"
                style={{
                  backgroundColor: secondaryColor,
                  borderTopColor: primaryColor,
                }}
              >
                <h3
                  className="text-4xl font-black mb-4"
                  style={{ fontFamily: selectedFont, color: primaryColor }}
                >
                  Building the Future.
                </h3>

                <p
                  className="mb-8 opacity-70"
                  style={{ fontFamily: selectedFont }}
                >
                  Preview of your typography and theme palette.
                </p>

                <button
                  className="px-8 py-3 rounded-xl font-bold"
                  style={{ backgroundColor: primaryColor }}
                >
                  Get Started
                </button>
              </div>

              <button
                onClick={handleApply}
                className="w-full py-5 bg-blue-600 hover:bg-blue-500 rounded-2xl font-black text-xl flex items-center justify-center gap-3 transition"
              >
                Use This Theme <ArrowRight />
              </button>
            </div>
          </div>

        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        ${GOOGLE_FONTS.map(font =>
          `@import url('https://fonts.googleapis.com/css2?family=${font.replace(/ /g,'+')}&display=swap');`
        ).join('\n')}

        .custom-scrollbar::-webkit-scrollbar{width:5px}
        .custom-scrollbar::-webkit-scrollbar-thumb{background:#334155;border-radius:10px}
        `
      }} />
    </div>
  );
};

export default Themes;

