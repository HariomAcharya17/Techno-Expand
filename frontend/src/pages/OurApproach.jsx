import { motion } from "framer-motion";
import BackButton from "../components/BackButton";

export default function OurApproach() {
  return (
    <div className="p-8 ml-64 mt-16">
      <BackButton />

      <motion.h1
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-6"
      >
        Our Approach
      </motion.h1>

      <div className="grid grid-cols-2 gap-6">
        {[
          {
            title: "Real-time Data Processing",
            desc: "We collect live sensor streams and process them every second.",
          },
          {
            title: "Machine Learning Engine",
            desc: "Our ML model predicts failures and identifies patterns early.",
          },
          {
            title: "Easy Visual Insights",
            desc: "All predictions and health data are converted into charts & dashboards.",
          },
          {
            title: "Smart Automation",
            desc: "We reduce downtime using proactive alerts before failures occur.",
          },
        ].map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.2 }}
            className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all"
          >
            <h2 className="text-xl font-semibold mb-3">{card.title}</h2>
            <p className="text-gray-600">{card.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}