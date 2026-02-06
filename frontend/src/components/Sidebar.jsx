import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { FaTachometerAlt, FaCogs, FaInfoCircle, FaUsers, FaUserCircle } from "react-icons/fa";

export default function Sidebar() {
  const links = [
    { to: "/dashboard", label: "Dashboard", icon: <FaTachometerAlt /> },
    { to: "/machines", label: "Machines", icon: <FaCogs /> },
    { to: "/our-mission", label: "Our Mission", icon: <FaInfoCircle /> },
    { to: "/our-approach", label: "Our Approach", icon: <FaCogs /> },
    { to: "/future-uses", label: "Future Uses", icon: <FaCogs /> },
    { to: "/our-team", label: "Our Team", icon: <FaUsers /> },
    { to: "/my-account", label: "My Account", icon: <FaUserCircle /> },
  ];

  return (
    <div className="fixed top-0 left-0 w-64 h-full bg-white/20 backdrop-blur-xl border-r shadow-xl p-6 flex flex-col">
      <h1 className="text-3xl font-bold text-blue-600 mb-10">TechnoExpand</h1>

      <nav className="space-y-3">
        {links.map((link, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <NavLink
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-3 p-3 rounded-xl transition ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-gray-700 hover:bg-blue-100"
                }`
              }
            >
              <span className="text-xl">{link.icon}</span>
              {link.label}
            </NavLink>
          </motion.div>
        ))}
      </nav>
    </div>
  );
}