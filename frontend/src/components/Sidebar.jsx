import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";

export default function Sidebar() {
  const menu = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Machines", path: "/machines" },
    { name: "Our Mission", path: "/our-mission" },
    { name: "Our Approach", path: "/our-approach" },
    { name: "Future Uses", path: "/future-uses" },
    { name: "Our Team", path: "/our-team" },
    { name: "My Account", path: "/my-account" },
  ];

  return (
    <motion.div
      initial={{ x: -50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-64 h-screen bg-white shadow-xl fixed left-0 top-0 p-6 flex flex-col"
    >
      {/* Logo / Title */}
      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-3xl font-extrabold mb-10 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"
      >
        Techno Expand
      </motion.h1>

      {/* Menu Items */}
      <div className="space-y-2">
        {menu.map((item, index) => (
          <motion.div
            key={item.path}
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.05 * index }}
          >
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                `block px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200
                ${
                  isActive
                    ? "bg-blue-600 text-white shadow-lg"
                    : "text-gray-700 hover:bg-gray-200 hover:shadow"
                }`
              }
            >
              {item.name}
            </NavLink>
          </motion.div>
        ))}
      </div>

      {/* Bottom Glow Effect */}
      <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-blue-100 opacity-30 pointer-events-none"></div>
    </motion.div>
  );
}