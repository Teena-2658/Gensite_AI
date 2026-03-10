import React, { useState, useEffect } from "react";
import LoginModal from "../components/LoginModel";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Zap, 
  Smartphone, 
  Rocket, 
  CheckCircle2, 
  ChevronRight, 
  LogOut, 
  LayoutDashboard,
  User
} from "lucide-react";

export default function Home() {
  const [openLogin, setOpenLogin] = useState(false);
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const navigate = useNavigate();

  const storedUser = localStorage.getItem("user");
  const userData = storedUser ? JSON.parse(storedUser) : null;

  /* FIREBASE AUTH LISTENER */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) setUser(currentUser);
      else setUser(null);
    });
    return () => unsubscribe();
  }, []);

  /* PROTECTED ACTION */
  const handleProtectedAction = () => {
    const stored = localStorage.getItem("user");
    if (stored) navigate("/dashboard");
    else setOpenLogin(true);
  };

  /* BUY CREDITS */
  const buyCredits = (credits) => {
    const stored = localStorage.getItem("user");
    if (!stored) {
      setOpenLogin(true);
      return;
    }
    alert(`Redirecting to buy ${credits} credits`);
    navigate("/dashboard");
  };

  /* LOGOUT */
  const handleLogout = async () => {
    await signOut(auth);
    localStorage.removeItem("user");
    setUser(null);
    setDropdownOpen(false);
    navigate("/");
  };

  // Animation Variants
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-700">
      
      {/* ================= NAVBAR ================= */}
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
              <Zap className="text-white fill-current" size={22} />
            </div>
            <span className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">
              GenSite AI
            </span>
          </motion.div>

          <div className="flex items-center gap-6">
            {!user ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setOpenLogin(true)}
                className="px-6 py-2.5 bg-slate-900 text-white rounded-full font-medium hover:bg-slate-800 transition-all shadow-md"
              >
                Get Started
              </motion.button>
            ) : (
              <div className="relative">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-3 p-1 pr-4 bg-gray-50 rounded-full border cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  <img
                    src={user.photoURL || "https://i.pravatar.cc/40"}
                    alt="user"
                    className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                  />
                  <span className="text-sm font-semibold text-slate-700">Account</span>
                </motion.div>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-3 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 p-3 z-50"
                    >
                      <div className="px-4 py-3 border-b border-gray-50 mb-2">
                        <p className="font-bold text-slate-900 truncate">{user.displayName}</p>
                        <p className="text-xs text-slate-500 truncate">{user.email}</p>
                      </div>

                      <button
                        onClick={() => { navigate("/dashboard"); setDropdownOpen(false); }}
                        className="w-full flex items-center gap-3 text-left py-2.5 hover:bg-blue-50 hover:text-blue-600 transition-colors rounded-xl px-3 text-slate-600 font-medium"
                      >
                        <LayoutDashboard size={18} /> Dashboard
                      </button>
                      
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 text-left py-2.5 text-red-500 hover:bg-red-50 transition-colors rounded-xl px-3 font-medium"
                      >
                        <LogOut size={18} /> Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* ================= HERO ================= */}
      <section className="relative pt-24 pb-20 px-6 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/50 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-[-5%] w-[30%] h-[30%] bg-emerald-100/50 rounded-full blur-[100px]" />
        </div>

        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 items-center gap-16">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-700 text-sm font-bold mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
              </span>
              New: AI Engine v3.0 is live
            </div>

            <h1 className="text-5xl lg:text-7xl font-black leading-[1.1] mb-8 tracking-tight text-slate-900">
              Build Stunning <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-500">
                Websites in Seconds
              </span>
            </h1>

            <p className="text-xl text-slate-600 mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              The world's most advanced AI website builder. Just describe your vision and watch the magic happen. Responsive, fast, and ready to launch.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)" }}
                whileTap={{ scale: 0.95 }}
                onClick={handleProtectedAction}
                className="bg-slate-900 text-white px-10 py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 group shadow-xl"
              >
                {userData ? "Go to Dashboard" : "Start Building Free"}
                <ChevronRight className="group-hover:translate-x-1 transition-transform" />
              </motion.button>
              
              <button className="px-10 py-5 rounded-2xl font-bold text-lg border-2 border-slate-200 hover:bg-slate-50 transition-colors">
                View Showcase
              </button>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative z-10 bg-white p-4 rounded-[2.5rem] shadow-2xl border border-gray-100">
              <img
                src="https://cdn-icons-png.flaticon.com/512/1055/1055687.png"
                alt="AI Website Builder"
                className="w-full max-w-md mx-auto transform -rotate-2 hover:rotate-0 transition-transform duration-500"
              />
            </div>
            {/* Decorative Elements */}
            <div className="absolute -top-6 -right-6 w-32 h-32 bg-emerald-400/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-blue-400/20 rounded-full blur-3xl" />
          </motion.div>
        </div>
      </section>

      {/* ================= FEATURES ================= */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            {...fadeInUp}
            className="text-center mb-20"
          >
            <h2 className="text-blue-600 font-bold tracking-widest uppercase text-sm mb-4">Core Capabilities</h2>
            <h3 className="text-4xl md:text-5xl font-black text-slate-900">Why Choose GenSite AI</h3>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { 
                icon: <Zap className="text-blue-600" />, 
                title: "Instant Generation", 
                desc: "Describe your business and get a full-scale website in under 30 seconds.",
                color: "bg-blue-50"
              },
              { 
                icon: <Smartphone className="text-emerald-600" />, 
                title: "Fully Responsive", 
                desc: "Every pixel is automatically optimized for mobile, tablet, and desktop screens.",
                color: "bg-emerald-50"
              },
              { 
                icon: <Rocket className="text-purple-600" />, 
                title: "One Click Deploy", 
                desc: "Publish instantly to our global edge network with custom domain support.",
                color: "bg-purple-50"
              }
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                {...fadeInUp}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -10 }}
                className="p-10 bg-gray-50/50 rounded-3xl border border-transparent hover:border-gray-200 hover:bg-white hover:shadow-xl transition-all group"
              >
                <div className={`w-14 h-14 ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4 text-slate-900">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= PRICING ================= */}
      <section className="py-24 bg-slate-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-6">Simple, Honest Pricing</h2>
            <p className="text-slate-600 max-w-2xl mx-auto text-lg">
              No subscriptions. No hidden fees. Just buy credits when you need them and build at your own pace.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* BASIC */}
            <motion.div 
              {...fadeInUp}
              whileHover={{ scale: 1.02 }}
              className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col"
            >
              <h3 className="text-lg font-bold text-slate-500 mb-2">Starter</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-black">₹99</span>
                <span className="text-slate-400">/one-time</span>
              </div>
              <ul className="space-y-4 mb-8 flex-grow">
                {['50 Credits', 'Basic AI Templates', 'Community Support'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-600">
                    <CheckCircle2 size={18} className="text-emerald-500" /> {item}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => buyCredits(50)}
                className="w-full py-4 rounded-xl font-bold border-2 border-slate-100 hover:bg-slate-900 hover:text-white transition-all"
              >
                Buy Credits
              </button>
            </motion.div>

            {/* POPULAR */}
            <motion.div 
              {...fadeInUp}
              whileHover={{ scale: 1.05 }}
              className="bg-white p-8 rounded-[2.2rem] shadow-2xl border-2 border-blue-600 relative overflow-hidden flex flex-col"
            >
              <div className="absolute top-0 right-0 bg-blue-600 text-white px-6 py-1 rounded-bl-2xl font-bold text-xs uppercase tracking-widest">
                Most Popular
              </div>
              <h3 className="text-lg font-bold text-blue-600 mb-2">Popular</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-5xl font-black">₹299</span>
                <span className="text-slate-400">/one-time</span>
              </div>
              <ul className="space-y-4 mb-8 flex-grow">
                {['200 Credits', 'Premium AI Engine', 'Custom Domains', 'Priority Support'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-700 font-medium">
                    <CheckCircle2 size={18} className="text-blue-500 fill-blue-50" /> {item}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => buyCredits(200)}
                className="w-full py-4 rounded-xl font-bold bg-blue-600 text-white shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all"
              >
                Buy Credits
              </button>
            </motion.div>

            {/* PRO */}
            <motion.div 
              {...fadeInUp}
              whileHover={{ scale: 1.02 }}
              className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col"
            >
              <h3 className="text-lg font-bold text-slate-500 mb-2">Pro</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-black">₹599</span>
                <span className="text-slate-400">/one-time</span>
              </div>
              <ul className="space-y-4 mb-8 flex-grow">
                {['500 Credits', 'Unrestricted Access', 'White-label Exports', 'VIP Support'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-600">
                    <CheckCircle2 size={18} className="text-emerald-500" /> {item}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => buyCredits(500)}
                className="w-full py-4 rounded-xl font-bold border-2 border-slate-100 hover:bg-slate-900 hover:text-white transition-all"
              >
                Buy Credits
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="bg-white py-12 px-6 border-t border-gray-100">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
              <Zap className="text-white fill-current" size={16} />
            </div>
            <span className="text-xl font-bold">GenSite AI</span>
          </div>
          
          <div className="text-slate-500 text-sm">
            © {new Date().getFullYear()} GenSite AI. Made with ❤️ for creators.
          </div>

          <div className="flex gap-6 text-sm font-medium text-slate-600">
            <a href="#" className="hover:text-blue-600 transition-colors">Privacy</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Terms</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Contact</a>
          </div>
        </div>
      </footer>

      <LoginModal
        open={openLogin}
        onClose={() => setOpenLogin(false)}
      />
    </div>
  );
}