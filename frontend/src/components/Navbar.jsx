import { useLocation } from "react-router-dom";

export default function Navbar() {
  const location = useLocation();

  // Titles for each page
  const titles = {
    "/": "Dashboard",
    "/machines": "Machines",
    "/our-mission": "Our Mission",
    "/our-approach": "Our Approach",
    "/future-uses": "Future Uses",
    "/our-team": "Our Team",
    "/my-account": "My Account",
  };

  const pageTitle = titles[location.pathname] || "";

  return (
    <div
      className="
        fixed top-0 left-64 right-0 h-16 
        backdrop-blur-xl bg-white/30 
        shadow-lg border-b border-white/20
        flex items-center justify-between 
        px-8 z-50
      "
    >
      {/* Page Title */}
      <h1 className="text-xl font-semibold text-gray-800 drop-shadow-sm">
        {pageTitle}
      </h1>

      {/* Logout Button — ONLY on Dashboard */}
      {["/", "/dashboard"].includes(location.pathname) && (
  <button
    onClick={() => alert('Logged Out Successfully!')}
    className="
      px-4 py-2 rounded-lg text-white text-sm 
      bg-gradient-to-r from-red-500 to-red-600 
      shadow-lg shadow-red-300/40
      hover:shadow-red-500/60 hover:scale-105 
      transition-all duration-300
    "
  >
    Logout
  </button>
)}
    </div>
  );
}