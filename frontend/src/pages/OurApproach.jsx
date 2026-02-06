import { motion } from "framer-motion";
import { useEffect } from "react";

export default function OurApproach() {
  useEffect(() => window.scrollTo(0, 0), []);

  const roadmap = [
    {
      title: "On-Device Sensing (ESP32)",
      text: "Sensors capture temperature, vibration, humidity & current.",
      emoji: "📡",
    },
    {
      title: "IoT Data Transmission",
      text: "ESP32 exposes local WiFi endpoint. Web app pulls real-time data.",
      emoji: "📶",
    },
    {
      title: "Backend Processing",
      text: "Data is cleaned, structured, and merged with ML pipeline.",
      emoji: "🖥️",
    },
    {
      title: "ML Prediction & Visualization",
      text: "AI predicts machine health, failure probability & RUL.",
      emoji: "📊",
    },
  ];

  return (
    <div className="ml-64 mt-20 p-10">

      {/* PARALLAX BANNER */}
      <motion.div
        className="relative h-52 rounded-3xl bg-gradient-to-r from-purple-500 to-orange-500 text-white flex items-center justify-center shadow-xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.h1
          className="text-4xl font-extrabold"
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 3 }}
        >
          Our Approach
        </motion.h1>
      </motion.div>

      {/* ROADMAP ZIGZAG */}
      <div className="relative mt-12 border-l-4 border-purple-300 ml-6">

        {roadmap.map((step, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: index % 2 === 0 ? -80 : 80 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="relative mb-12 pl-10"
          >
            {/* Dot */}
            <div className="absolute -left-[11px] w-6 h-6 rounded-full bg-purple-500 border-4 border-white shadow"></div>

            {/* Card */}
            <div className="p-6 rounded-2xl bg-white shadow-lg border w-[70%]">
              <div className="text-4xl">{step.emoji}</div>
              <h3 className="text-xl font-bold mt-2">{step.title}</h3>
              <p className="text-gray-600 mt-2">{step.text}</p>
            </div>
          </motion.div>
        ))}

      </div>
    </div>
  );
}