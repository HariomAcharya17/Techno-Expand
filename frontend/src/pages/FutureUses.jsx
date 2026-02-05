import { motion } from "framer-motion";
import BackButton from "../components/BackButton";

export default function FutureUses() {
  return (
    <div className="p-8 ml-64 mt-16">
      <BackButton />

      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-6"
      >
        Future Uses
      </motion.h1>

      <div className="space-y-6">
        {[
          "Predictive maintenance for all industrial systems",
          "Fully automated plant-level dashboards",
          "Integrating robotics with ML-based decision systems",
          "Creating a central AI assistant for factory intelligence",
        ].map((text, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.15 }}
            className="bg-white p-5 rounded-lg shadow-lg border-l-4 border-green-500"
          >
            <p className="text-lg">{text}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}