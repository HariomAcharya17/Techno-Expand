import { motion } from "framer-motion";
import BackButton from "../components/BackButton";

export default function OurMission() {
  return (
    <div className="p-8 ml-64 mt-16">
      <BackButton />

      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-6"
      >
        Our Mission
      </motion.h1>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-white shadow-xl p-6 rounded-xl leading-relaxed text-lg"
      >
        <p className="mb-3">
          Techno-Expand aims to revolutionize industrial machine monitoring by
          providing real-time insights into machine health, performance, and
          failure prediction.
        </p>

        <p className="mb-3">
          Our mission is to reduce downtime, improve operational efficiency, and
          help industries transition into smart manufacturing using AI-based
          data intelligence.
        </p>

        <p>
          Through continuous monitoring and precision ML predictions, we
          empower factories to make proactive decisions—not reactive ones.
        </p>
      </motion.div>
    </div>
  );
}