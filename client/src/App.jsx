// src/App.jsx
import React from "react";
import { useSelector } from "react-redux";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Home from "./pages/Home.jsx";
import Dashboard from "./pages/Dashboard.jsx";
// import Generate from "./pages/Generate.jsx"; 
import PaymentSuccess from "./pages/PaymentSuccess.jsx";
import PreviewPage from "./pages/PreviewPage";
import useGetCurrentUser from "./hooks/useGetCurrentUser.jsx";
import Templates from './pages/Templates';
import Themes from "./components/Themes.jsx";
function App() {
  useGetCurrentUser();

  const storedUser = localStorage.getItem("user");
  const userData = storedUser ? JSON.parse(storedUser) : null;

  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Home />} />

        <Route
          path="/dashboard"
          element={userData ? <Dashboard /> : <Navigate to="/" replace />}
        />

        <Route path="/preview/:id" element={<PreviewPage />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      <Route path="/templates" element={<Templates />} />
      <Route path="/themes" element={<Themes />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;