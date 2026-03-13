import React, { useState, useEffect, useRef } from "react";
import LoginModal from "../components/LoginModel";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import {
  Zap,
  Sparkles,
  Cpu,
  ArrowRight,
  ShieldCheck,
  Layers,
  ChevronDown,
  ChevronUp,
  Paperclip,
  AtSign,
  Send,
} from "lucide-react";
import { Twitter, Instagram, Youtube, Github } from "lucide-react";
import TemplateCard from "../components/TemplateCard"; // Make sure this path is correct
import { TEMPLATES_DATA } from "../constants"; // Correct import based on your constants.js

/* ─────────────────────────────────────────────
FAQ SECTION
───────────────────────────────────────────── */
const faqs = [
  { question: "What is GenSite.AI?", answer: "GenSite.AI turns your text description into a complete responsive website instantly." },
  { question: "How do credits work?", answer: "Credits are pay-as-you-go. Generate websites using credits without monthly subscriptions." },
  { question: "Do I own the generated code?", answer: "Yes. You get exportable HTML / React / Next.js code." },
];

function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null);
  const toggleFAQ = (index) => setOpenIndex(openIndex === index ? null : index);

  return (
    <section id="faq" className="py-20 px-5 bg-[#050816]">
      <div className="max-w-3xl mx-auto space-y-4">
        <h2 className="text-3xl font-bold text-center mb-10 text-white">Frequently Asked Questions</h2>
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="border border-white/5 rounded-2xl bg-white/[0.02] backdrop-blur-md overflow-hidden"
          >
            <button
              onClick={() => toggleFAQ(index)}
              className="w-full px-6 py-5 flex justify-between items-center text-left transition-colors hover:bg-white/[0.03]"
            >
              <span className="font-medium text-slate-200">{faq.question}</span>
              {openIndex === index ? (
                <ChevronUp className="text-blue-500" />
              ) : (
                <ChevronDown className="text-slate-500" />
              )}
            </button>
            <AnimatePresence>
              {openIndex === index && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-6 text-slate-400 text-sm leading-relaxed">{faq.answer}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
TESTIMONIAL CARD
───────────────────────────────────────────── */
const TestimonialCard = ({ name, handle, text, imageUrl }) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-80px" }}
    transition={{ duration: 0.7 }}
    className="w-[400px] flex-shrink-0 bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-3xl p-8 hover:border-blue-500/50 transition-all duration-300 group"
  >
    <div className="flex items-center gap-4 mb-6">
      <img
        src={imageUrl || `https://ui-avatars.com/api/?name=${name}&background=0D8ABC&color=fff`}
        alt={name}
        className="w-12 h-12 rounded-full object-cover border border-white/10"
      />
      <div className="text-left">
        <p className="font-bold text-slate-100 group-hover:text-blue-400 transition-colors">{name}</p>
        <p className="text-sm text-slate-500">{handle}</p>
      </div>
    </div>
    <p className="text-slate-300 text-base leading-relaxed text-left italic">"{text}"</p>
  </motion.div>
);

/* ─────────────────────────────────────────────
HOME PAGE
───────────────────────────────────────────── */
export default function Home() {
  const [openLogin, setOpenLogin] = useState(false);
  const [user, setUser] = useState(null);
  const [billingCycle, setBillingCycle] = useState("monthly");
  const navigate = useNavigate();

  const [displayText, setDisplayText] = useState("");
  const [promptIndex, setPromptIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  const showcasePrompts = [
    "Build a professional portfolio for a creative designer...",
    "Create a customer support portal for my SaaS...",
    "Generate a lead generation landing page for marketing...",
    "Make an outbound sales website with integrated calls...",
  ];

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, setUser);
    return unsub;
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

  const pricingPlans = [
    { name: "Starter", price: 29, desc: "Start smart with AI", features: ["1 Agent", "Automation", "AI Chat"] },
    { name: "Growth", price: 49, desc: "Scale faster with Agents", features: ["5 Agents", "Advanced Flows", "Smart Memory"] },
    { name: "Scale", price: 149, desc: "Maximum automation", features: ["Unlimited Agents", "Custom Flows", "Long Term Memory"], popular: true },
    { name: "Enterprise", price: 550, desc: "AI infrastructure built", features: ["Custom Agents", "Process Automation", "Multi-System AI"] },
  ];

  const testimonials = [
    {
      name: "Sophia Turner",
      handle: "@sophia_branding",
      text: "As someone with zero coding experience, I was worried about building my website. But this template made it so easy!",
      row: 1,
      imageUrl: "https://thumbs.dreamstime.com/b/woman-portrait-confident-office-creativity-smile-space-design-startup-person-happy-arms-crossed-creative-agency-career-360903459.jpg"
    },
    {
      name: "Emma Collins",
      handle: "@emma_creates",
      text: "I've tried many builders, but the AI integration here is next level. It actually understands what I want.",
      row: 1,
      imageUrl: "https://thumbs.dreamstime.com/b/portrait-happy-young-business-woman-isolated-gray-background-mockup-space-face-professional-smile-creative-designer-299579917.jpg"
    },
    {
      name: "Noah Reed",
      handle: "@noah_builds",
      text: "As a first-time founder, I had no idea where to start. This template gave me confidence and made the process smooth.",
      row: 2,
      imageUrl: "https://thumbs.dreamstime.com/b/social-media-presence-head-shot-portrait-modern-confident-handsome-young-businessman-beard-glasses-startup-founder-office-409567026.jpg"
    },
    {
      name: "Liam Bennet",
      handle: "@liam_dev",
      text: "I never imagined building a site could be this easy. The AI guided me at every stage, and my website now feels pro.",
      row: 2,
      imageUrl: "https://as1.ftcdn.net/jpg/06/33/80/44/1000_F_633804450_DWH5bj77LdDwlCSvMcqy6qVk4j9kchT3.jpg"
    },
    {
      name: "Isabella Hayes",
      handle: "@isabella_designs",
      text: "Stunning designs generated automatically. All I had to do was click 'generate' and tweak a few things!",
      row: 2,
      imageUrl: "https://thumbs.dreamstime.com/b/attractive-young-woman-smiles-portrait-fashion-designer-office-attractive-young-woman-smiles-portrait-fashion-designer-287245443.jpg"
    },
  ];

  const row1 = testimonials.filter((t) => t.row === 1);
  const row2 = testimonials.filter((t) => t.row === 2);

  // Parallax refs & values
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const titleY = useTransform(scrollYProgress, [0, 1], ["0%", "-15%"]);

  return (
    <div className="bg-[#050816] min-h-screen text-white overflow-x-hidden">
      {/* NAVBAR */}
      <nav className="fixed top-0 w-full z-50 bg-[#050816]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <div 
            className="flex items-center gap-2 font-bold text-xl cursor-pointer" 
            onClick={() => navigate("/")}
          >
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/30">
              <Zap size={16} fill="currentColor" />
            </div>
            GenSite
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-8 text-slate-400 text-sm">
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#testimonials" className="hover:text-white transition-colors">Testimonials</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </div>

          {/* CTA Button */}
          <button
            onClick={handleProtectedAction}
            className="px-5 py-2 rounded-full bg-white text-black font-semibold text-sm hover:bg-slate-200 transition-all shadow-xl"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* HERO with subtle parallax */}
      <section ref={heroRef} id="home" className="relative pt-40 pb-16 overflow-hidden text-center">
        <motion.div
          style={{ y: bgY }}
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[700px] bg-blue-600/10 blur-[140px] rounded-full pointer-events-none"
        />
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <motion.h1
            style={{ y: titleY }}
            className="text-5xl md:text-7xl font-bold tracking-tight mb-6"
          >
            The AI Agent for <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300 italic">
              building websites
            </span>
          </motion.h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg md:text-xl mb-10 leading-relaxed">
            From idea to production-ready website in seconds. Describe your vision and let GenSite.AI handle the rest.
          </p>

          {/* AI CHAT BOX */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="max-w-3xl mx-auto bg-[#0b1224] border border-white/10 rounded-2xl p-4 shadow-2xl relative"
          >
            <div className="flex items-start gap-3 min-h-[60px] text-left px-2">
              <div className="text-slate-200 text-lg font-medium py-2">
                {displayText}
                <span className="inline-block w-[2px] h-5 ml-1 bg-blue-500 animate-pulse align-middle" />
              </div>
            </div>
            <div className="flex justify-between items-center mt-6 pt-4 border-t border-white/5">
              <div className="flex gap-2 items-center">
                <button className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-slate-300 flex items-center gap-2">
                  <Sparkles size={14} className="text-blue-400" /> Prompt Builder
                </button>
                <button className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-slate-300 flex items-center gap-2">
                  <Cpu size={14} className="text-purple-400" /> Gemini 3 Pro
                </button>
                <div className="flex gap-3 items-center px-4 border-l border-white/10 ml-2">
                  <AtSign size={16} className="text-slate-500 cursor-pointer hover:text-white transition-colors" />
                  <Paperclip size={16} className="text-slate-500 cursor-pointer hover:text-white transition-colors" />
                </div>
              </div>
              <div
                onClick={handleProtectedAction}
                className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/40 cursor-pointer hover:scale-105 transition-transform"
              >
                <Send size={18} fill="white" className="ml-0.5" />
              </div>
            </div>
          </motion.div>

          {/* PILLS */}
          <div className="flex flex-wrap justify-center gap-3 mt-10 max-w-4xl mx-auto">
            {["Personal Website", "Customer Support", "Outbound Sales Calls", "Meet Recorder", "Lead Gen"].map((pill) => (
              <motion.button
                key={pill}
                whileHover={{ scale: 1.05 }}
                className="px-5 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-slate-300 hover:bg-white/10 transition-all flex items-center gap-2"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500/60 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                {pill}
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING - reduced padding */}
      <section id="pricing" className="py-20 bg-[#050816] relative">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Pricing Plans</h2>
          <p className="text-slate-400 mb-10">Intelligent AI agents built to automate, optimize, and scale your business.</p>

          <div className="flex justify-center items-center gap-4 mb-12">
            <div className="bg-white/5 border border-white/10 p-1 rounded-full flex items-center">
              <button
                onClick={() => setBillingCycle("monthly")}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${billingCycle === "monthly" ? "bg-blue-600 text-white" : "text-slate-400"}`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle("yearly")}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${billingCycle === "yearly" ? "bg-blue-600 text-white" : "text-slate-400"}`}
              >
                Yearly <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded">-20%</span>
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {pricingPlans.map((plan, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.7, delay: i * 0.1 }}
                className={`relative rounded-3xl p-7 border transition-all duration-300 flex flex-col ${plan.popular ? "bg-[#0b1224] border-blue-500 shadow-[0_0_40px_rgba(59,130,246,0.15)] scale-105" : "bg-white/[0.02] border-white/5"}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-bold px-4 py-1 rounded-full uppercase tracking-widest">
                    Popular
                  </div>
                )}
                <div className="text-left mb-6">
                  <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                  <p className="text-slate-500 text-sm mb-4">{plan.desc}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">
                      ${billingCycle === "monthly" ? plan.price : Math.floor(plan.price * 0.8)}
                    </span>
                    <span className="text-slate-500">/month</span>
                  </div>
                </div>

                <button
                  onClick={handleProtectedAction}
                  className={`w-full py-3 rounded-2xl font-semibold mb-8 transition-all ${plan.popular ? "bg-blue-600 text-white hover:bg-blue-500" : "bg-white/5 text-white hover:bg-white/10 border border-white/10"}`}
                >
                  Choose this plan
                </button>

                <div className="text-left mt-auto">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">What's included:</p>
                  <ul className="space-y-3">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-center gap-3 text-sm text-slate-300">
                        <div className="w-5 h-5 rounded-md bg-white/5 border border-white/10 flex items-center justify-center">
                          <Zap size={10} className="text-blue-500" />
                        </div>
                        {feat}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* BRAND LOGOS - reduced padding */}
      <section className="py-16 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-6 flex flex-wrap justify-center items-center gap-12 md:gap-20 opacity-50 hover:opacity-100 transition-opacity duration-700 grayscale">
          <div className="flex items-center gap-2 text-2xl font-bold tracking-tighter">
            <div className="bg-white text-black px-1.5 py-0.5 rounded text-sm">M</div> MILANO
          </div>
          <div className="text-2xl font-black tracking-widest">SAVANNAH</div>
          <div className="flex items-center gap-2 text-2xl font-semibold">
            <div className="w-6 h-6 border-2 border-white rounded-full bg-white/20" /> Amsterdam
          </div>
          <div className="text-3xl font-serif italic">theo</div>
        </div>
      </section>

   <div className="text-center mt-16">
  <button
    onClick={() => navigate("/templates")}
    className="inline-flex items-center gap-3 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-full transition-all shadow-lg shadow-blue-600/25"
  >
    Explore Templates <ArrowRight size={20} />
  </button>
</div>

      {/* ────────── TESTIMONIAL MARQUEE ────────── */}
      <section id="testimonials" className="py-20 overflow-hidden">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
            What Our Users Say
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto">
            Real people building real websites faster with GenSite.AI
          </p>
        </div>
        <div className="flex flex-col gap-8">
          <div className="flex overflow-hidden relative">
            <motion.div
              className="flex gap-6 whitespace-nowrap"
              animate={{ x: ["0%", "-50%"] }}
              transition={{ repeat: Infinity, ease: "linear", duration: 30 }}
            >
              {[...row1, ...row1, ...row1].map((t, i) => (
                <TestimonialCard key={`r1-${i}`} {...t} />
              ))}
            </motion.div>
          </div>
          <div className="flex overflow-hidden relative">
            <motion.div
              className="flex gap-6 whitespace-nowrap"
              animate={{ x: ["-50%", "0%"] }}
              transition={{ repeat: Infinity, ease: "linear", duration: 35 }}
            >
              {[...row2, ...row2, ...row2].map((t, i) => (
                <TestimonialCard key={`r2-${i}`} {...t} />
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      <FAQSection />

      {/* FOOTER - reduced padding */}
      <footer className="bg-[#050816] text-white pt-16 pb-10 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-16">
            <div>
              <div className="flex items-center gap-2 font-bold text-2xl mb-5">
                <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
                  <Zap size={20} fill="currentColor" />
                </div>
                Agenly
              </div>
              <p className="text-slate-400 text-sm leading-relaxed mb-6 max-w-[240px]">
                Agenly — Automate Smarter, Optimize Faster, and Grow Stronger.
              </p>
              <div className="flex gap-5 text-slate-500">
                <Twitter size={18} className="hover:text-white cursor-pointer transition-colors" />
                <Instagram size={18} className="hover:text-white cursor-pointer transition-colors" />
                <Youtube size={18} className="hover:text-white cursor-pointer transition-colors" />
                <Github size={18} className="hover:text-white cursor-pointer transition-colors" />
              </div>
            </div>

            <div className="grid grid-cols-3 col-span-3 gap-8">
              <div>
                <h4 className="font-semibold mb-5 text-slate-200">Pages</h4>
                <ul className="space-y-3 text-slate-400 text-sm">
                  <li><a href="/" className="hover:text-blue-400 transition-colors">Home</a></li>
                  <li><a href="/blog" className="hover:text-blue-400 transition-colors">Blog</a></li>
                  <li><a href="/404" className="hover:text-blue-400 transition-colors">404</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-5 text-slate-200">Links</h4>
                <ul className="space-y-3 text-slate-400 text-sm">
                  <li><a href="#services" className="hover:text-blue-400 transition-colors">Services</a></li>
                  <li><a href="#pricing" className="hover:text-blue-400 transition-colors">Pricing</a></li>
                  <li><a href="#benefits" className="hover:text-blue-400 transition-colors">Benefits</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-5 text-slate-200">Information</h4>
                <ul className="space-y-3 text-slate-400 text-sm">
                  <li><a href="/contact" className="hover:text-blue-400 transition-colors">Contact</a></li>
                  <li><a href="/privacy" className="hover:text-blue-400 transition-colors">Privacy</a></li>
                  <li><a href="/terms" className="hover:text-blue-400 transition-colors">Terms</a></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
            <h3 className="text-2xl md:text-3xl font-bold tracking-tight">
              Get Free Smart Note Workflows
            </h3>
            <div className="flex w-full md:w-auto gap-3 p-1.5 bg-white/5 border border-white/10 rounded-full max-w-md">
              <input
                type="email"
                placeholder="Enter your Email"
                className="bg-transparent border-none outline-none px-6 py-2 text-sm flex-grow text-white placeholder:text-slate-500"
              />
              <button className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-2.5 rounded-full text-sm font-semibold transition-all">
                Subscribe
              </button>
            </div>
          </div>

          <div className="mt-12 text-center text-slate-600 text-xs tracking-widest uppercase">
            © {new Date().getFullYear()} Agenly AI. All rights reserved.
          </div>
        </div>
      </footer>

      <LoginModal open={openLogin} onClose={() => setOpenLogin(false)} />
    </div>
  );
}