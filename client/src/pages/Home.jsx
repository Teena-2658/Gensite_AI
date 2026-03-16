import React, { useState, useEffect, useRef } from "react";
import LoginModal from "../components/LoginModel";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import {
  Zap, Sparkles, Cpu, ArrowRight, ShieldCheck, 
  ChevronDown, ChevronUp, Send, Twitter, Instagram, 
  Youtube, Github, Layers
} from "lucide-react";

/* ─── DATA CONSTANTS ─── */
const showcasePrompts = [
  "Build a professional portfolio for a creative designer...",
  "Create a customer support portal for my SaaS...",
  "Generate a lead generation landing page for marketing...",
  "Make an outbound sales website with integrated code...",
];

const testimonials = [
  { name: "Alex Rivera", handle: "@arivera_dev", text: "GenSite.AI turned my rough idea into a fully functional React landing page in 30 seconds. Mind-blowing.", imageUrl: "https://i.pravatar.cc/150?u=1" },
  { name: "Sarah Chen", handle: "@sarahdesigns", text: "The quality of the UI components is better than most premium templates I've paid for.", imageUrl: "https://i.pravatar.cc/150?u=2" },
  { name: "Marcus Thorne", handle: "@m_thorne", text: "Finally, an AI that doesn't just write code but actually builds a cohesive brand experience.", imageUrl: "https://i.pravatar.cc/150?u=3" },
  { name: "Elena Rossi", handle: "@elena_builds", text: "I spin up lead-gen pages for clients in one afternoon. The ROI is off the charts.", imageUrl: "https://i.pravatar.cc/150?u=4" },
  { name: "Jordan Smith", handle: "@jsmith_tech", text: "Exporting to Next.js was seamless. It's now my go-to for rapid prototyping.", imageUrl: "https://i.pravatar.cc/150?u=5" },
];

const faqs = [
  { question: "What is GenSite.AI?", answer: "GenSite.AI turns your text description into a complete responsive website instantly using advanced AI." },
  { question: "How do credits work?", answer: "Credits are pay-as-you-go. Generate websites using credits without monthly subscriptions." },
  { question: "Do I own the generated code?", answer: "Yes. You get exportable HTML / React / Next.js code that you can host anywhere." },
];

const pricingPlans = [
  { name: "Starter", price: 29, desc: "Start smart with AI", features: ["1 Site", "Basic Templates", "AI Support"] },
  { name: "Growth", price: 49, desc: "Scale faster", features: ["5 Sites", "Advanced UI", "Custom Domains"] },
  { name: "Scale", price: 149, desc: "Maximum automation", features: ["Unlimited Sites", "Full Export", "Priority GPU"], popular: true },
  { name: "Enterprise", price: 550, desc: "Custom infra", features: ["White Label", "API Access", "Dedicated Support"] },
];

/* ─── TESTIMONIAL CARD ─── */
const TestimonialCard = ({ name, handle, text, imageUrl }) => (
  <div className="w-[380px] flex-shrink-0 bg-white/[0.02] backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-8 hover:border-blue-500/30 transition-all group mx-4">
    <div className="flex items-center gap-4 mb-6">
      <img src={imageUrl} alt={name} className="w-12 h-12 rounded-full object-cover border border-white/10" />
      <div className="text-left">
        <p className="font-bold text-slate-100">{name}</p>
        <p className="text-xs text-slate-500">{handle}</p>
      </div>
    </div>
    <p className="text-slate-400 text-sm leading-relaxed text-left italic">"{text}"</p>
  </div>
);

/* ─── MAIN HOME COMPONENT ─── */
export default function Home() {
  const [openLogin, setOpenLogin] = useState(false);
  const [user, setUser] = useState(null);
  const [displayText, setDisplayText] = useState("");
  const [promptIndex, setPromptIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [openFaq, setOpenFaq] = useState(null);

  const navigate = useNavigate();
  const heroRef = useRef(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      const savedUser = localStorage.getItem("user");
      if (firebaseUser && savedUser) setUser(JSON.parse(savedUser));
      else setUser(null);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const current = showcasePrompts[promptIndex];
    const speed = isDeleting ? 30 : 60;
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        setDisplayText(current.substring(0, displayText.length + 1));
        if (displayText === current) setTimeout(() => setIsDeleting(true), 2000);
      } else {
        setDisplayText(current.substring(0, displayText.length - 1));
        if (displayText === "") {
          setIsDeleting(false);
          setPromptIndex((prev) => (prev + 1) % showcasePrompts.length);
        }
      }
    }, speed);
    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, promptIndex]);

  const handleProtectedAction = () => {
    if (user) navigate("/dashboard");
    else setOpenLogin(true);
  };

  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);

  return (
    <div className="bg-[#050816] min-h-screen text-white selection:bg-blue-500/30">
      
      {/* NAVBAR */}
      <nav className="fixed top-0 w-full z-50 bg-[#050816]/80 backdrop-blur-lg border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl cursor-pointer" onClick={() => navigate("/")}>
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
              <Zap size={18} fill="currentColor" />
            </div>
            <span className="tracking-tighter text-2xl">GenSite</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-slate-400 text-sm font-medium">
            <a href="#testimonials" className="hover:text-white transition-colors">Testimonials</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </div>
          <button onClick={handleProtectedAction} className="px-6 py-2.5 rounded-full bg-white text-black font-bold text-sm hover:bg-slate-200 transition-all shadow-lg">
            {user ? "Dashboard" : "Get Started"}
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section ref={heroRef} className="relative pt-48 pb-24 overflow-hidden text-center">
        <motion.div style={{ y: bgY }} className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-blue-600/10 blur-[140px] pointer-events-none" />
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold mb-8 tracking-widest uppercase">
            <Sparkles size={14} /> AI-Powered Web Design
          </motion.div>
          <h1 className="text-6xl md:text-8xl font-black mb-8 leading-[0.9] tracking-tight">
            The AI Agent for <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300 italic">building websites</span>
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg md:text-xl mb-12 font-medium">
            Describe your vision in plain English and watch GenSite.AI transform it into a high-performance website in seconds.
          </p>
          <div className="max-w-3xl mx-auto bg-[#0b1224] border border-white/10 rounded-[2.5rem] p-6 shadow-2xl relative">
            <div className="text-left min-h-[60px] text-xl font-medium text-slate-100 px-4">{displayText}<span className="inline-block w-1.5 h-6 ml-2 bg-blue-500 animate-pulse align-middle" /></div>
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-white/5">
              <div className="flex gap-2">
                <button className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-400 hover:text-white flex items-center gap-2"><Cpu size={14} /> Gemini 3 Flash</button>
                <button className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-400 hover:text-white flex items-center gap-2"><Layers size={14} /> Templates</button>
              </div>
              <button onClick={handleProtectedAction} className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center hover:scale-110 transition-all shadow-lg shadow-blue-600/40">
                <Send size={20} fill="white" className="ml-1" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS SECTION - PROPER INFINITE MARQUEE */}
      <section id="testimonials" className="py-24 bg-[#050816] overflow-hidden border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 text-center mb-20">
          <h2 className="text-4xl md:text-6xl font-black tracking-tight">Wall of Love</h2>
          <p className="text-slate-500 mt-4 font-medium">Join 2,000+ creators building with GenSite AI</p>
        </div>

        <div className="space-y-8 relative">
          {/* Fading Edges Overlays */}
          <div className="absolute inset-y-0 left-0 w-40 bg-gradient-to-r from-[#050816] to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-40 bg-gradient-to-l from-[#050816] to-transparent z-10 pointer-events-none" />

          {/* Row 1 - Forward Scroll */}
          <div className="flex overflow-hidden group">
            <motion.div 
              className="flex"
              animate={{ x: ["0%", "-50%"] }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            >
              {[...testimonials, ...testimonials].map((t, i) => (
                <TestimonialCard key={i} {...t} />
              ))}
            </motion.div>
          </div>

          {/* Row 2 - Reverse Scroll */}
          <div className="flex overflow-hidden group">
            <motion.div 
              className="flex"
              animate={{ x: ["-50%", "0%"] }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            >
              {[...testimonials, ...testimonials].map((t, i) => (
                <TestimonialCard key={i} {...t} />
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-24 bg-[#050816] border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-6xl font-black mb-6">Simple Pricing</h2>
          <div className="flex justify-center mb-16">
            <div className="bg-white/5 p-1.5 rounded-full border border-white/10 flex gap-2">
              <button onClick={() => setBillingCycle("monthly")} className={`px-8 py-2 rounded-full text-sm font-bold transition-all ${billingCycle === "monthly" ? "bg-blue-600 text-white" : "text-slate-400"}`}>Monthly</button>
              <button onClick={() => setBillingCycle("yearly")} className={`px-8 py-2 rounded-full text-sm font-bold transition-all ${billingCycle === "yearly" ? "bg-blue-600 text-white" : "text-slate-400"}`}>Yearly -20%</button>
            </div>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {pricingPlans.map((plan, i) => (
              <div key={i} className={`p-8 rounded-[2.5rem] border transition-all ${plan.popular ? "bg-[#0b1224] border-blue-500/50 scale-105 shadow-2xl" : "bg-white/[0.02] border-white/10"}`}>
                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                <div className="text-4xl font-black mb-6">${billingCycle === "monthly" ? plan.price : Math.floor(plan.price * 0.8)}<span className="text-sm text-slate-500 font-medium">/mo</span></div>
                <button onClick={handleProtectedAction} className={`w-full py-4 rounded-2xl font-bold text-sm mb-8 ${plan.popular ? "bg-blue-600 text-white" : "bg-white/10 text-white hover:bg-white/20"}`}>Select Plan</button>
                <ul className="space-y-4 text-left">
                  {plan.features.map((f, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-sm text-slate-400"><ShieldCheck size={16} className="text-blue-500" /> {f}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 bg-[#050816] border-t border-white/5">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-4xl font-black text-center mb-12">Common Questions</h2>
          <div className="space-y-4">
            {faqs.map((f, i) => (
              <div key={i} className="border border-white/10 rounded-3xl bg-white/[0.02] overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full p-6 flex justify-between items-center text-left">
                  <span className="font-bold">{f.question}</span>
                  {openFaq === i ? <ChevronUp /> : <ChevronDown />}
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden bg-white/[0.01]">
                      <div className="p-6 pt-0 text-slate-400 text-sm leading-relaxed">{f.answer}</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="pt-24 pb-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-12 mb-20">
            <div className="text-center md:text-left">
              <div className="flex items-center gap-2 font-bold text-3xl mb-4 justify-center md:justify-start">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center"><Zap size={20} fill="currentColor" /></div>
                GenSite
              </div>
              <p className="text-slate-500 max-w-xs">The future of web development, powered by artificial intelligence.</p>
            </div>
            <div className="flex gap-6">
              {[Twitter, Github, Instagram, Youtube].map((Icon, i) => (
                <div key={i} className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 cursor-pointer transition-all"><Icon size={20} /></div>
              ))}
            </div>
          </div>
          <div className="text-center text-slate-600 text-xs tracking-widest uppercase">© {new Date().getFullYear()} GENSITE AI. Built for the future.</div>
        </div>
      </footer>

      <LoginModal open={openLogin} onClose={() => setOpenLogin(false)} setUser={setUser} />
    </div>
  );
}