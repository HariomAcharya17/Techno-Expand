import { motion } from "framer-motion";
import { useEffect } from "react";

export default function FutureUses() {
  useEffect(() => window.scrollTo(0, 0), []);

  const uses = [
    {
      icon: "⚡",
      title: "Smart Energy Management",
      text: "Predict machine load & reduce power waste.",
      bg: "bg-[#f0f7ff]", // soft blue
    },
    {
      icon: "🤖",
      title: "Autonomous Maintenance",
      text: "ML bots schedule maintenance automatically.",
      bg: "bg-[#f8f2ff]", // lavender
    },
    {
      icon: "☁️",
      title: "Cloud Integration",
      text: "Push live data to AWS, Azure, or Google Cloud.",
      bg: "bg-[#fef7f0]", // sand
    },
    {
      icon: "🔮",
      title: "Full Predictive Factory",
      text: "Zero-downtime industry with AI-driven insights.",
      bg: "bg-[#f3fff5]", // mint
    },
  ];

  return (
    <div className="ml-64 mt-20 p-10 bg-gray-50 min-h-screen text-gray-800">

      {/* HEADER — Soft Premium Gradient */}
      <motion.div
        className="
          rounded-3xl px-10 py-10
          bg-gradient-to-r from-[#eef5ff] via-[#f4eeff] to-[#eef5ff]
          border border-gray-200 shadow-md
          flex items-center justify-between relative
        "
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <motion.h1
          className="text-4xl font-extrabold text-gray-900"
        >
          Future Uses
        </motion.h1>

        <motion.span
          className="absolute right-6 top-6 text-4xl opacity-80"
          animate={{ y: [0, -6, 0], opacity: [1, 0.85, 1] }}
          transition={{ repeat: Infinity, duration: 3.5 }}
        >
          🔮
        </motion.span>
      </motion.div>

      {/* FUTURE USE CARDS — Professional Pastel & Smaller */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
        {uses.map((u, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: i % 2 === 0 ? -60 : 60 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className={`
              p-6 rounded-2xl 
              border border-gray-200 
              shadow-lg hover:shadow-xl 
              transition-all duration-300
              cursor-pointer
              ${u.bg}
            `}
          >
            <div className="text-4xl">{u.icon}</div>
            <h3 className="text-xl font-semibold text-gray-900 mt-3">
              {u.title}
            </h3>
            <p className="text-gray-600 mt-2">{u.text}</p>
          </motion.div>
        ))}
      </div>

      <div className="mt-20 h-16 bg-gradient-to-b from-transparent to-gray-100 rounded-xl"></div>
    </div>
  );
}