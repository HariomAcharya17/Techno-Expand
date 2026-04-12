// src/App.jsx
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";

import Dashboard from "./pages/Dashboard";
import Machines from "./pages/Machines";
import MachineDetails from "./pages/MachineDetails";

import OurMission from "./pages/OurMission";
import OurApproach from "./pages/OurApproach";
import FutureUses from "./pages/FutureUses";
import OurTeam from "./pages/OurTeam";
import MyAccount from "./pages/MyAccount";

// Auth
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ProtectedRoute from "./components/ProtectedRoute";

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <Routes location={location} key={location.pathname}>
          {/* Public */}
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/machines" element={<Machines />} />
            <Route path="/machine/:id" element={<MachineDetails />} />
            <Route path="/our-mission" element={<OurMission />} />
            <Route path="/our-approach" element={<OurApproach />} />
            <Route path="/future-uses" element={<FutureUses />} />
            <Route path="/our-team" element={<OurTeam />} />
            <Route path="/my-account" element={<MyAccount />} />
          </Route>
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <PageLayoutWrapper>
        <AnimatedRoutes />
      </PageLayoutWrapper>
    </BrowserRouter>
  );
}

// ⭐ Layout wrapper that can use useLocation()
function PageLayoutWrapper({ children }) {
  const location = useLocation();
  const noLayout =
    location.pathname === "/" || location.pathname === "/signup";

  return (
    <>
      {!noLayout && <Sidebar />}
      {!noLayout && <Navbar />}
      {children}
    </>
  );
}