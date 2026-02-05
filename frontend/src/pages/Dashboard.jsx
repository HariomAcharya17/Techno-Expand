import { Pie, Line } from "react-chartjs-2";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

export default function Dashboard() {
  const [liveData, setLiveData] = useState({});
  const [healthHistory, setHealthHistory] = useState([]);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8000/ws/data");

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setLiveData(data);

      const avgHealth =
        Object.values(data).reduce((acc, m) => acc + m.health, 0) /
        Object.values(data).length;

      setHealthHistory((prev) => [...prev.slice(-20), avgHealth]);
    };

    return () => ws.close();
  }, []);

  const machines = Object.values(liveData);

  const healthyCount = machines.filter((m) => m.condition === "Healthy").length;
  const mediumCount = machines.filter((m) => m.condition === "Medium").length;
  const failCount = machines.filter((m) => m.condition === "Fail").length;

  return (
    <motion.div
      className="p-10 ml-64 mt-16"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">
          Real-time monitoring & analysis of all industrial machines.
        </p>
      </motion.div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-4 gap-6 mt-8">
        {[
          {
            title: "Total Machines",
            value: machines.length || 0,
            color: "text-blue-600",
            delay: 0.2,
          },
          {
            title: "Healthy Machines",
            value: healthyCount,
            color: "text-green-600",
            delay: 0.3,
          },
          {
            title: "Warning Machines",
            value: mediumCount,
            color: "text-yellow-500",
            delay: 0.4,
          },
          {
            title: "Failed Machines",
            value: failCount,
            color: "text-red-500",
            delay: 0.5,
          },
        ].map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.4, delay: card.delay }}
            whileHover={{ scale: 1.03 }}
            className="bg-white shadow-lg hover:shadow-xl rounded-xl p-6 transition-all"
          >
            <h3 className="text-gray-500 text-sm">{card.title}</h3>
            <p className={`text-3xl font-bold mt-2 ${card.color}`}>
              {card.value}
            </p>
          </motion.div>
        ))}
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-2 gap-8 mt-10">
        {/* PIE CHART */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          whileHover={{ scale: 1.01 }}
          className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all"
        >
          <h2 className="text-xl font-semibold mb-4">Overall Machine Status</h2>
          <Pie
            data={{
              labels: ["Healthy", "Medium", "Fail"],
              datasets: [
                {
                  data: [healthyCount, mediumCount, failCount],
                  backgroundColor: ["#22c55e", "#eab308", "#ef4444"],
                  hoverOffset: 12,
                },
              ],
            }}
          />
        </motion.div>

        {/* LINE CHART */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          whileHover={{ scale: 1.01 }}
          className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all"
        >
          <h2 className="text-xl font-semibold mb-4">Average Health Trend</h2>
          <Line
            data={{
              labels: healthHistory.map((_, i) => i),
              datasets: [
                {
                  label: "Avg Health (%)",
                  data: healthHistory,
                  borderColor: "#3b82f6",
                  backgroundColor: "rgba(59,130,246,0.2)",
                  borderWidth: 3,
                  tension: 0.4,
                },
              ],
            }}
          />
        </motion.div>
      </div>
    </motion.div>
  );
}