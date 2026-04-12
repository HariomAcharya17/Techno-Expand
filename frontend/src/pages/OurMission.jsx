import { motion } from "framer-motion";
import { useEffect } from "react";

export default function OurMission() {
  useEffect(() => window.scrollTo(0, 0), []);

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0 },
  };

  const staggerParent = {
    hidden: {},
    show: {
      transition: { staggerChildren: 0.15 },
    },
  };

  const staggerItem = {
    hidden: { opacity: 0, y: 25 },
    show: { opacity: 1, y: 0 },
  };

  const cards = [
    {
      title: "Hardware + IoT",
      icon: "🔧",
      text: "ESP32-based real-time vibration & temperature tracking.",
      bg: "bg-[#f0f7ff]",
    },
    {
      title: "AI Predictions",
      icon: "🧠",
      text: "Machine learning identifies abnormal behavior early.",
      bg: "bg-[#f8f2ff]",
    },
    {
      title: "Industrial Workflow",
      icon: "🏭",
      text: "Designed to resemble production-level monitoring workflows.",
      bg: "bg-[#fef7f0]",
    },
    {
      title: "Smart Alerts",
      icon: "📢",
      text: "Instant warnings for unsafe or risky machine behavior.",
      bg: "bg-[#fff5f5]",
    },
    {
      title: "Live Dashboards",
      icon: "📊",
      text: "Clean and intuitive analytics visualization.",
      bg: "bg-[#f3fff5]",
    },
    {
      title: "Scalable Design",
      icon: "⚡",
      text: "Built to scale from prototypes to full industrial use.",
      bg: "bg-[#f4faff]",
    },
  ];

  return (
    <div className="ml-64 mt-20 p-10 bg-gray-50 min-h-screen text-gray-800">

      {/* HEADER — Soft Gradient */}
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
          Our Mission
        </motion.h1>

        {/* Animated Icons */}
        <motion.span
          className="absolute left-6 top-6 text-4xl opacity-80"
          animate={{ y: [0, -6, 0], opacity: [1, 0.85, 1] }}
          transition={{ repeat: Infinity, duration: 4 }}
        >
          🚀
        </motion.span>

        <motion.span
          className="absolute right-6 bottom-6 text-4xl opacity-80"
          animate={{ y: [0, 6, 0], opacity: [1, 0.85, 1] }}
          transition={{ repeat: Infinity, duration: 4 }}
        >
          ⚙️
        </motion.span>
      </motion.div>

      {/* TEXT SECTION */}
      <motion.div
        className="mt-10 max-w-4xl leading-relaxed text-gray-700 text-lg"
        variants={fadeUp}
        initial="hidden"
        whileInView="show"
        transition={{ duration: 0.6 }}
      >
        <p>
          At <strong className="text-blue-600">TechnoExpand</strong>, our mission is
          to build a <strong className="text-gray-900">next-generation predictive maintenance platform</strong>
          powered by modern IoT, analytics, and smart automation.
        </p>

        <p className="mt-5">
          We combine{" "}
          <span className="text-blue-600 font-semibold">IoT sensors</span>,{" "}
          <span className="text-blue-600 font-semibold">Edge AI</span>,{" "}
          <span className="text-blue-600 font-semibold">data modeling</span>, and{" "}
          <span className="text-blue-600 font-semibold">real-time dashboards</span>{" "}
          to build a system that doesn’t just detect issues —
          <strong className="text-gray-900"> it predicts failures early.</strong>
        </p>

        <p className="mt-5 font-semibold text-gray-800">
          Our goal is simple: help industries reduce downtime and maximize machine life.
        </p>
      </motion.div>

      {/* FEATURE CARDS — Pastel Professional */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-14"
        variants={staggerParent}
        initial="hidden"
        whileInView="show"
      >
        {cards.map((item, i) => (
          <motion.div
            key={i}
            variants={staggerItem}
            whileHover={{ scale: 1.03 }}
            transition={{ type: "spring", stiffness: 180 }}
            className={`
              p-6 rounded-2xl 
              border border-gray-200 shadow-lg 
              hover:shadow-xl transition-all duration-300
              ${item.bg}
            `}
          >
            <div className="text-4xl">{item.icon}</div>
            <h3 className="text-2xl font-semibold text-gray-900 mt-3">
              {item.title}
            </h3>
            <p className="text-gray-600 mt-2">{item.text}</p>
          </motion.div>
        ))}
      </motion.div>

      <div className="mt-24 h-20 bg-gradient-to-b from-transparent to-gray-100 rounded-xl"></div>
    </div>
  );
}