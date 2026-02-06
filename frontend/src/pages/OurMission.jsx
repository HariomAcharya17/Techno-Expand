import { motion } from "framer-motion";
import { useEffect } from "react";

export default function OurMission() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="ml-64 mt-20 p-10">

      {/* PARALLAX BANNER */}
      <motion.div
        className="relative h-52 rounded-3xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white flex items-center justify-center shadow-xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.h1
          className="text-4xl font-extrabold"
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 3 }}
        >
          Our Mission
        </motion.h1>

        {/* FLOATING EMOJIS */}
        <motion.span
          className="absolute left-10 top-10 text-4xl"
          animate={{ y: [0, 15, 0], rotate: [0, 5, -5, 0] }}
          transition={{ repeat: Infinity, duration: 4 }}
        >
          🚀
        </motion.span>

        <motion.span
          className="absolute right-10 bottom-10 text-4xl"
          animate={{ y: [0, -15, 0], rotate: [0, -5, 5, 0] }}
          transition={{ repeat: Infinity, duration: 4 }}
        >
          ⚙️
        </motion.span>
      </motion.div>

      {/* CONTENT */}
      <motion.div
        className="mt-10 text-lg text-gray-700 leading-relaxed"
        variants={fadeUp}
        initial="hidden"
        whileInView="show"
        transition={{ duration: 0.6 }}
      >
        <p>
          Our mission is to bring <strong>industrial-grade predictive maintenance</strong> 
          into a compact, college-level prototype — without compromising on accuracy or realism.
        </p>

        <p className="mt-4">
          We combine <strong>ESP32 hardware</strong>, <strong>IoT connectivity</strong>,{" "}
          <strong>cloud-inspired backend processing</strong>, and{" "}
          <strong>Machine Learning predictions</strong> to build a system that behaves 
          like a real manufacturing industry setup.
        </p>

        <p className="mt-4">
          Our goal is simple: <strong>Prevent machine failure before it happens.</strong>
        </p>
      </motion.div>

      {/* 3 MISSION CARDS */}
      <div className="grid grid-cols-3 gap-8 mt-12">
        {[
          { title: "Hardware + IoT", icon: "🔧", text: "Real-time sensor readings from ESP32." },
          { title: "ML Predictions", icon: "🧠", text: "AI models predict machine health & RUL." },
          { title: "Industry Workflow", icon: "🏭", text: "Simulates factory-grade monitoring." },
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: i % 2 === 0 ? -40 : 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="p-6 rounded-2xl bg-white shadow-lg border hover:shadow-xl cursor-pointer"
          >
            <div className="text-4xl">{item.icon}</div>
            <h3 className="text-xl font-semibold mt-2">{item.title}</h3>
            <p className="text-gray-600 mt-2">{item.text}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}