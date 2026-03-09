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
import PreviewPage from "./pages/PreviewPage";
import useGetCurrentUser from "./hooks/useGetCurrentUser.jsx";

function App() {
  useGetCurrentUser();

  const userData = useSelector((state) => state.user?.userData ?? null);

  return (
    <BrowserRouter>
      <Routes>
        {/* Always show Home at root – no auto-redirect for logged-in users */}
        <Route path="/" element={<Home />} />

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={userData ? <Dashboard /> : <Navigate to="/" replace />}
        />
{/* 
        <Route
          path="/generate"
          element={userData ? <Generate /> : <Navigate to="/" replace />}
        /> */}

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
        <Route path="/preview/:id" element={<PreviewPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;