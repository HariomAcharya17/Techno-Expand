import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./lib/chart";

import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Machines from "./pages/Machines";
import MachineDetails from "./pages/MachineDetails";
import Alerts from "./pages/Alerts";
import Dataset from "./pages/Dataset";
import CaseStudy from "./pages/CaseStudy";
import Architecture from "./pages/Architecture";
import OurTeam from "./pages/OurTeam";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/machines" element={<Machines />} />
          <Route path="/machine/:id" element={<MachineDetails />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/case-study" element={<CaseStudy />} />
          <Route path="/dataset" element={<Dataset />} />
          <Route path="/architecture" element={<Architecture />} />
          <Route path="/our-team" element={<OurTeam />} />
          {/* old routes */}
          <Route path="/dashboard" element={<Navigate to="/" replace />} />
          <Route path="/our-mission" element={<Navigate to="/architecture" replace />} />
          <Route path="/our-approach" element={<Navigate to="/architecture" replace />} />
          <Route path="/future-uses" element={<Navigate to="/architecture" replace />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
