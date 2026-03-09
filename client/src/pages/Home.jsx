import React, { useState, useEffect } from "react";
import LoginModal from "../components/LoginModel";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const [openLogin, setOpenLogin] = useState(false);
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const navigate = useNavigate();

  const userData = JSON.parse(localStorage.getItem("user"));
useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
    if (currentUser) {
      setUser(currentUser);
    } else {
      setUser(null);
    }
  });

  return () => unsubscribe();
}, []);


  const handleProtectedAction = () => {
    if (userData) {
      navigate("/dashboard");
    } else {
      setOpenLogin(true);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-white">

      {/* ================= NAVBAR ================= */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          
          <div className="text-2xl font-bold text-blue-600">
            GenSite AI
          </div>

          {!user ? (
            <button
              onClick={() => setOpenLogin(true)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
            >
              Get Started
            </button>
          ) : (
            <div className="relative">
              
              <img
                src={user.photoURL || "https://i.pravatar.cc/40"}
                alt="user"
                className="w-10 h-10 rounded-full cursor-pointer"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              />

              {dropdownOpen && (
                <div className="absolute right-0 mt-3 w-64 bg-white rounded-xl shadow-xl border p-4 z-50">

                  <div className="mb-3">
                    <p className="font-semibold text-gray-800">
                      {user.displayName}
                    </p>
                    <p className="text-sm text-gray-500">
                      {user.email}
                    </p>
                  </div>

                  <hr className="my-2" />

                  <button
                    onClick={() => navigate("/dashboard")}
                    className="w-full text-left py-2 hover:bg-gray-100 rounded px-2"
                  >
                    Dashboard
                  </button>

                  <button
                    onClick={handleLogout}
                    className="w-full text-left py-2 text-red-500 hover:bg-gray-100 rounded px-2"
                  >
                    Logout
                  </button>

                </div>
              )}

            </div>
          )}

        </div>
      </nav>


      {/* ================= HERO ================= */}
      <section className="pt-28 pb-20 px-4">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 items-center gap-10">

          <div className="text-center md:text-left">

            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6">
              Build Stunning Websites
              <br />
              with{" "}
              <span className="bg-gradient-to-r from-blue-600 to-emerald-500 bg-clip-text text-transparent">
                AI in Seconds
              </span>
            </h1>

            <p className="text-lg text-gray-600 mb-8 max-w-xl">
              GenSite AI helps creators, startups, and businesses generate
              professional websites instantly — without coding.
            </p>

            <button
              onClick={handleProtectedAction}
              className="bg-gradient-to-r from-blue-600 to-emerald-500 text-white px-8 py-4 rounded-full font-semibold shadow-lg hover:scale-105 transition"
            >
              {user ? "Go to Dashboard" : "Get Started"}
            </button>

          </div>

          <div className="relative">
            <img
              src="https://cdn-icons-png.flaticon.com/512/1055/1055687.png"
              alt="AI Website Builder"
              className="w-full max-w-md mx-auto"
            />
          </div>

        </div>
      </section>


      {/* ================= FEATURES ================= */}
      <section className="py-20 bg-white">

        <div className="max-w-6xl mx-auto text-center px-4">

          <h2 className="text-4xl font-bold mb-16">
            Why Choose <span className="text-blue-600">GenSite AI?</span>
          </h2>

          <div className="grid md:grid-cols-3 gap-8">

            {[
              {
                icon: "⚡",
                title: "Instant Generation",
                desc: "Generate full production-ready websites in seconds using AI."
              },
              {
                icon: "🎨",
                title: "Modern UI Design",
                desc: "Beautiful SaaS layouts designed for startups and creators."
              },
              {
                icon: "🚀",
                title: "Optimized Performance",
                desc: "Fast loading, responsive and SEO optimized websites."
              }
            ].map((item, index) => (

              <div
                key={index}
                className="p-8 rounded-2xl border bg-gradient-to-br from-white to-gray-50 shadow-sm hover:shadow-2xl hover:-translate-y-3 transition duration-500"
              >

                <div className="text-4xl mb-4">
                  {item.icon}
                </div>

                <h3 className="font-semibold text-xl mb-2">
                  {item.title}
                </h3>

                <p className="text-gray-600">
                  {item.desc}
                </p>

              </div>

            ))}

          </div>

        </div>

      </section>


      {/* ================= PRICING ================= */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-emerald-50">

        <div className="max-w-6xl mx-auto text-center px-4">

          <h2 className="text-4xl font-bold mb-12">
            Simple Pricing
          </h2>

          <div className="grid md:grid-cols-3 gap-8">

            {/* Starter */}
            <div className="bg-white rounded-3xl shadow-lg border p-10">

              <h3 className="text-2xl font-bold mb-4">
                Starter
              </h3>

              <p className="text-gray-500 mb-6">
                Perfect for individuals
              </p>

              <div className="text-5xl font-bold mb-6">
                $0
              </div>

              <button
                onClick={handleProtectedAction}
                className="w-full py-3 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Get Started
              </button>

            </div>


            {/* Pro */}
            <div className="bg-gradient-to-br from-blue-600 to-emerald-600 text-white rounded-3xl shadow-2xl p-10 scale-105">

              <h3 className="text-2xl font-bold mb-4">
                Pro
              </h3>

              <div className="text-5xl font-bold mb-6">
                $29
              </div>

              <button
                onClick={handleProtectedAction}
                className="w-full py-3 bg-white text-blue-700 rounded-lg font-bold"
              >
                Upgrade
              </button>

            </div>


            {/* Enterprise */}
            <div className="bg-white rounded-3xl shadow-lg border p-10">

              <h3 className="text-2xl font-bold mb-4">
                Enterprise
              </h3>

              <p className="text-gray-500 mb-6">
                For large teams
              </p>

              <div className="text-4xl font-bold mb-6">
                Custom
              </div>

              <button
                onClick={() =>
                  (window.location.href =
                    "mailto:support@gensite.ai")
                }
                className="w-full py-3 bg-gray-800 text-white rounded-lg"
              >
                Contact Sales
              </button>

            </div>

          </div>

        </div>

      </section>


      {/* ================= FOOTER ================= */}
      <footer className="bg-white py-8 text-center text-gray-600 border-t">
        © {new Date().getFullYear()} GenSite AI. All rights reserved.
      </footer>


      <LoginModal
        open={openLogin}
        onClose={() => setOpenLogin(false)}
      />

    </div>
  );
}