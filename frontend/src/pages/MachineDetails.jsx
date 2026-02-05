import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import { motion, AnimatePresence } from "framer-motion";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend
);

export default function MachineDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [healthHistory, setHealthHistory] = useState([]);
  const [timestampHistory, setTimestampHistory] = useState([]);
  const [showCalendar, setShowCalendar] = useState(false);

  useEffect(() => {
  const ws = new WebSocket("ws://localhost:8000/ws/data");

  ws.onmessage = (event) => {
    const machines = JSON.parse(event.data);
    const machine = machines[id];

    if (machine) {
      setData(machine);

      const timestamp = new Date().toLocaleTimeString();
      setHealthHistory((prev) => [...prev.slice(-30), machine.health]);
      setTimestampHistory((prev) => [...prev.slice(-30), timestamp]);
    }
  };

  ws.onopen = () => console.log("WS connected");
  ws.onerror = (err) => console.log("WS error:", err);

  // --- FIX: prevent unwanted disconnect error ---
  return () => {
    if (ws.readyState === 1) {
      ws.close(1000, "Component unmounted");
    }
  };
}, [id]);

  // LOADING FALLBACK
  if (!data || !data.sensor) {
    return (
      <div className="ml-64 mt-20 p-10 text-xl text-gray-600">
        Loading machine data...
      </div>
    );
  }

  // EXPORT TO EXCEL
  const exportToExcel = () => {
    const workbook = XLSX.utils.book_new();

    const machineSheetData = [
      ["Machine Name", data.name],
      ["Condition", data.condition],
      ["Health (%)", data.health],
      ["Failure (%)", data.failure],
      ["RLU (Days)", data.rlu],
      ["Last Checked", data.last_checked],
      ["Next Service", data.next_service],
      [],
      ["Sensor Name", "Value"],
      ...Object.entries(data.sensor),
      [],
      ["Timestamp", "Health (%)"],
      ...timestampHistory.map((t, i) => [t, healthHistory[i]])
    ];

    const sheet = XLSX.utils.aoa_to_sheet(machineSheetData);
    XLSX.utils.book_append_sheet(workbook, sheet, "Machine Data");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    saveAs(new Blob([excelBuffer]), `${data.name}_data.xlsx`);
  };

  const statusColor = {
    Healthy: "bg-green-500 shadow-green-300",
    Medium: "bg-yellow-500 shadow-yellow-300",
    Fail: "bg-red-500 shadow-red-300",
  };

  return (
    <motion.div
      className="ml-64 mt-20 p-10"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* BACK BUTTON */}
      <button
        onClick={() => navigate(-1)}
        className="px-4 py-2 mb-6 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
      >
        ← Back
      </button>

      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 drop-shadow">
            {data.name}
          </h1>
          <p className="text-gray-500 mt-1 text-sm">Machine ID: {id}</p>
        </div>

        <motion.div
          className={`px-6 py-3 rounded-full text-white font-semibold shadow-xl ${statusColor[data.condition]}`}
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 120 }}
        >
          {data.condition}
        </motion.div>
      </div>

      {/* TOP SUMMARY + GRAPH */}
      <div className="grid grid-cols-3 gap-8">

        {/* SUMMARY PANEL */}
        <motion.div
          className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200 backdrop-blur-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-xl font-semibold mb-4">Performance Summary</h2>

          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="font-medium text-gray-600">Health</span>
              <span className="text-3xl font-bold text-blue-600">{data.health}%</span>
            </div>

            <div className="flex justify-between">
              <span className="font-medium text-gray-600">Failure Probability</span>
              <span className="text-3xl font-bold text-red-600">{data.failure}%</span>
            </div>

            <div className="flex justify-between">
              <span className="font-medium text-gray-600">RLU (Remaining Days)</span>
              <span className="text-3xl font-bold text-green-600">{data.rlu} Days</span>
            </div>

            <button
              onClick={exportToExcel}
              className="mt-6 w-full py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition"
            >
              Export Data (Excel)
            </button>
          </div>
        </motion.div>

        {/* FIXED GRAPH SIZE (CLEAN + ALIGNED) */}
        <motion.div
          className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200 col-span-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-xl font-semibold mb-4">Health Trend (Live)</h2>

          <div className="relative h-64">
            <Line
              data={{
                labels: timestampHistory,
                datasets: [
                  {
                    label: "Health (%)",
                    data: healthHistory,
                    borderColor: "#2563eb",
                    backgroundColor: "rgba(37,99,235,0.15)",
                    borderWidth: 3,
                    tension: 0.35,
                    pointRadius: 2,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { labels: { font: { size: 12 } } },
                  tooltip: {
                    titleFont: { size: 12 },
                    bodyFont: { size: 12 },
                    callbacks: {
                      label: (context) => `Health: ${context.raw}%`,
                    },
                  },
                },
                scales: {
                  x: {
                    ticks: {
                      font: { size: 10 },
                      maxRotation: 0,
                      minRotation: 0,
                    },
                  },
                  y: {
                    ticks: {
                      callback: (value) => value + "%",
                      font: { size: 10 },
                    },
                    suggestedMin: 0,
                    suggestedMax: 100,
                  },
                },
              }}
            />
          </div>
        </motion.div>
      </div>

    

      {/* LIVE METRICS */}
<h2 className="text-2xl font-bold mt-10 mb-4">Live Machine Metrics</h2>

<div className="grid grid-cols-3 gap-6">

  {[
    { key: "temperature", label: "Temperature", unit: "°C", emoji: "🌡", color: "from-red-500 to-orange-400" },
    { key: "pressure", label: "Pressure", unit: "Bar", emoji: "🔵", color: "from-blue-500 to-cyan-400" },
    { key: "vibration", label: "Vibration", unit: "mm/s", emoji: "📳", color: "from-purple-500 to-pink-400" },
    { key: "humidity", label: "Humidity", unit: "%", emoji: "💧", color: "from-green-500 to-emerald-400" },
    { key: "current", label: "Current", unit: "A", emoji: "⚡", color: "from-yellow-500 to-orange-300" },
    { key: "voltage", label: "Voltage", unit: "V", emoji: "🔌", color: "from-indigo-500 to-blue-400" },
    { key: "rpm", label: "RPM", unit: "rpm", emoji: "🔁", color: "from-pink-500 to-rose-400" },
    { key: "load", label: "Load", unit: "%", emoji: "🏋️", color: "from-teal-500 to-green-400" },
    { key: "noise", label: "Noise", unit: "dB", emoji: "🔊", color: "from-gray-600 to-gray-400" }
  ].map((item) => (
    <motion.div
      key={item.key}
      className={`bg-white p-6 rounded-xl shadow-lg border relative overflow-hidden group`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      {/* COLOR STRIP */}
      <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${item.color}`}></div>

      {/* LABEL */}
      <div className="text-gray-500 font-medium flex items-center gap-2 capitalize">
        <span className="text-xl">{item.emoji}</span> 
        {item.label}
      </div>

      {/* VALUE */}
      <div className="text-3xl font-bold mt-2 text-blue-600">
        {Number(data.sensor[item.key]).toFixed(2)}{" "}
        <span className="text-lg text-gray-500">{item.unit}</span>
      </div>
    </motion.div>
  ))}
</div>

      {/* VIEW CALENDAR BUTTON */}
      <button
        onClick={() => setShowCalendar(true)}
        className="mt-10 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
      >
        View Maintenance Calendar
      </button>

      {/* 3D FLIP CALENDAR POPUP */}
      <AnimatePresence>
        {showCalendar && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >

            <motion.div
              className="bg-white p-8 rounded-2xl shadow-2xl w-96"
              initial={{ rotateY: 90, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              exit={{ rotateY: 90, opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            >
              <h3 className="text-2xl font-bold mb-4">Maintenance Calendar</h3>

              <p className="mb-2">
                <strong>Last Checked:</strong> {data.last_checked}
              </p>

              <p className="mb-4">
                <strong>Next Service:</strong> {data.next_service}
              </p>

              <button
                onClick={() => setShowCalendar(false)}
                className="mt-4 px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 transition"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}