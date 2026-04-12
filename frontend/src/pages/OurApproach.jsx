import { motion } from "framer-motion";
import { useEffect } from "react";

export default function OurApproach() {
  useEffect(() => window.scrollTo(0, 0), []);

  const roadmap = [
    {
      title: "On-Device Sensing (ESP32)",
      text: "Sensors capture temperature, vibration, humidity & current.",
      emoji: "📡",
      bg: "bg-[#f0f7ff]", // Soft Blue
    },
    {
      title: "IoT Data Transmission",
      text: "ESP32 exposes local WiFi endpoint. Web app pulls real-time data.",
      emoji: "📶",
      bg: "bg-[#f8f2ff]", // Soft Lavender
    },
    {
      title: "Backend Processing",
      text: "Data is cleaned, structured, and merged with ML pipeline.",
      emoji: "🖥️",
      bg: "bg-[#fef7f0]", // Soft Sand
    },
    {
      title: "ML Prediction & Visualization",
      text: "AI predicts machine health, failure probability & RUL.",
      emoji: "📊",
      bg: "bg-[#f3fff5]", // Soft Mint
    },
  ];

  return (
    <div className="ml-64 mt-20 p-10 bg-white-50 min-h-screen text-gray-800">

      {/* HEADER */}
      {/* HEADER */}
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
    Our Approach
  </motion.h1>

  <motion.span
    className="absolute right-6 top-6 text-4xl opacity-70"
    animate={{ y: [0, -6, 0], opacity: [1, 0.85, 1] }}
    transition={{ repeat: Infinity, duration: 3.5 }}
  >
    ⚙️
  </motion.span>
</motion.div>

      {/* TIMELINE */}
      <div className="relative mt-14 border-l-4 border-blue-400 ml-6">

        {roadmap.map((step, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: index % 2 === 0 ? -60 : 60 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="relative mb-12 pl-10"
          >
            {/* Timeline Dot */}
            <div className="absolute -left-[13px] w-7 h-7 rounded-full bg-blue-500 border-4 border-white shadow-lg"></div>

            {/* PREMIUM COLORED CARD */}
            <div
              className={`
                p-6 rounded-2xl shadow-xl 
                border border-gray-200 
                ${step.bg} 
                w-[78%]
                transition-all duration-300
                hover:shadow-2xl
              `}
            >
              <div className="text-4xl">{step.emoji}</div>
              <h3 className="text-xl font-bold mt-2 text-gray-900">
                {step.title}
              </h3>
              <p className="text-gray-600 mt-2">{step.text}</p>
            </div>
          </motion.div>
        ))}

      </div>

      <div className="mt-20 h-20 bg-gradient-to-b from-transparent to-gray-100 rounded-xl"></div>
    </div>
  );
}