import { motion } from "framer-motion";
import { useEffect } from "react";

export default function FutureUses() {
  useEffect(() => window.scrollTo(0, 0), []);

  const uses = [
    { icon: "⚡", title: "Smart Energy Management", text: "Predict machine load & reduce power waste." },
    { icon: "🤖", title: "Autonomous Maintenance", text: "ML bots schedule maintenance automatically." },
    { icon: "☁️", title: "Cloud Integration", text: "Push live data to AWS, Azure, or Google Cloud." },
    { icon: "🔮", title: "Full Predictive Factory", text: "Zero-downtime industry with AI-driven insights." },
  ];

  return (
    <div className="ml-64 mt-20 p-10">

      {/* PARALLAX HEADER */}
      <motion.div
        className="relative h-52 rounded-3xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white flex items-center justify-center shadow-xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.h1
          className="text-4xl font-bold"
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 3 }}
        >
          Future Uses
        </motion.h1>
      </motion.div>

      {/* FUTURE CARDS */}
      <div className="grid grid-cols-2 gap-8 mt-12">
        {uses.map((u, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: i % 2 === 0 ? -60 : 60 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="p-8 bg-white rounded-2xl shadow-xl hover:shadow-2xl border cursor-pointer"
          >
            <div className="text-5xl">{u.icon}</div>
            <h3 className="text-2xl font-bold mt-3">{u.title}</h3>
            <p className="text-gray-600 mt-2">{u.text}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}