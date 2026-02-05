import { BrowserRouter, Routes, Route } from "react-router-dom";
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

export default function App() {
  return (
    <BrowserRouter>
      <Sidebar />
      <Navbar />

      <Routes>
        {/* Dashboard Route */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Machines */}
        <Route path="/machines" element={<Machines />} />
        <Route path="/machines/:id" element={<MachineDetails />} />

        {/* Informational Pages */}
        <Route path="/our-mission" element={<OurMission />} />
        <Route path="/our-approach" element={<OurApproach />} />
        <Route path="/future-uses" element={<FutureUses />} />
        <Route path="/our-team" element={<OurTeam />} />
        <Route path="/my-account" element={<MyAccount />} />
      </Routes>
    </BrowserRouter>
  );
}