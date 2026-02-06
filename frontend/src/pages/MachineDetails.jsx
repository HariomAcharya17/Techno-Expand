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

  // ============================================================
  //  WEBSOCKET FETCH
  // ============================================================
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

    return () => {
      if (ws.readyState === 1) ws.close(1000);
    };
  }, [id]);

  if (!data || !data.sensor) {
    return (
      <div className="ml-64 mt-20 p-10 text-xl text-gray-600">
        Loading machine data...
      </div>
    );
  }

  // ============================================================
  //  EXPORT EXCEL
  // ============================================================
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
      ...timestampHistory.map((t, i) => [t, healthHistory[i]]),
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

  // ============================================================
  //  RETURN UI
  // ============================================================
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

      {/* ======================================================
          SUMMARY + GRAPH
      ======================================================= */}
      <div className="grid grid-cols-3 gap-8">
        {/* SUMMARY */}
        <motion.div
          className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200 backdrop-blur-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-xl font-semibold mb-4">Performance Summary</h2>

          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="font-medium text-gray-600">Health</span>
              <span className="text-3xl font-bold text-blue-600">
                {data.health}%
              </span>
            </div>

            <div className="flex justify-between">
              <span className="font-medium text-gray-600">Failure Probability</span>
              <span className="text-3xl font-bold text-red-600">
                {data.failure}%
              </span>
            </div>

            <div className="flex justify-between">
              <span className="font-medium text-gray-600">
                RLU (Remaining Days)
              </span>
              <span className="text-3xl font-bold text-green-600">
                {data.rlu} Days
              </span>
            </div>

            <button
              onClick={exportToExcel}
              className="mt-6 w-full py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition"
            >
              Export Data (Excel)
            </button>
          </div>
        </motion.div>

        {/* GRAPH */}
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
                    pointRadius: 3,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { labels: { font: { size: 12 } } },
                  tooltip: {
                    callbacks: {
                      label: (context) => `Health: ${context.raw}%`,
                    },
                  },
                },
                scales: {
                  y: { ticks: { callback: (v) => v + "%" } },
                },
              }}
            />
          </div>
        </motion.div>
      </div>

      {/* ======================================================
          MAINTENANCE TIMELINE (NEW UI)
      ======================================================= */}
      <h2 className="text-2xl font-bold mt-12 mb-6">Maintenance Timeline</h2>

      <div className="pl-6 relative">
        {/* Vertical timeline line */}
        <div className="absolute left-3 top-0 w-1 h-full bg-gray-200 rounded-full"></div>

        {data.maintenanceHistory?.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="relative mb-8"
          >
            {/* Dot */}
            <div className="absolute -left-1 w-4 h-4 bg-blue-500 border-4 border-white rounded-full shadow"></div>

            {/* Card */}
            <div className="ml-8 p-5 bg-white rounded-2xl shadow-lg border">
              <div className="flex justify-between items-center mb-1">
                <h3 className="font-semibold text-gray-800">{item.event}</h3>
                <span className="text-gray-500 text-sm">{item.date}</span>
              </div>

              <p className="text-gray-700 text-sm">
                <strong>Engineer:</strong> {item.engineer}
              </p>

              <p className="text-gray-600 text-sm mt-1">
                <strong>Notes:</strong> {item.notes}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ======================================================
          LIVE METRICS
      ======================================================= */}
      <h2 className="text-2xl font-bold mt-12 mb-4">Live Machine Metrics</h2>

      <div className="grid grid-cols-3 gap-6">
        {[
          {
            key: "temperature",
            label: "Temperature",
            unit: "°C",
            emoji: "🌡",
            color: "from-red-500 to-orange-400",
          },
          {
            key: "pressure",
            label: "Pressure",
            unit: "Bar",
            emoji: "🔵",
            color: "from-blue-500 to-cyan-400",
          },
          {
            key: "vibration",
            label: "Vibration",
            unit: "mm/s",
            emoji: "📳",
            color: "from-purple-500 to-pink-400",
          },
          {
            key: "humidity",
            label: "Humidity",
            unit: "%",
            emoji: "💧",
            color: "from-green-500 to-emerald-400",
          },
          {
            key: "current",
            label: "Current",
            unit: "A",
            emoji: "⚡",
            color: "from-yellow-500 to-orange-300",
          },
          {
            key: "voltage",
            label: "Voltage",
            unit: "V",
            emoji: "🔌",
            color: "from-indigo-500 to-blue-400",
          },
          {
            key: "rpm",
            label: "RPM",
            unit: "rpm",
            emoji: "🔁",
            color: "from-pink-500 to-rose-400",
          },
          {
            key: "load",
            label: "Load",
            unit: "%",
            emoji: "🏋️",
            color: "from-teal-500 to-green-400",
          },
          {
            key: "noise",
            label: "Noise",
            unit: "dB",
            emoji: "🔊",
            color: "from-gray-600 to-gray-400",
          },
        ].map((item) => (
          <motion.div
            key={item.key}
            className="bg-white p-6 rounded-xl shadow-lg border relative overflow-hidden group"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div
              className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${item.color}`}
            ></div>

            <div className="text-gray-500 font-medium flex items-center gap-2 capitalize">
              <span className="text-xl">{item.emoji}</span>
              {item.label}
            </div>

            <div className="text-3xl font-bold mt-2 text-blue-600">
              {Number(data.sensor[item.key]).toFixed(2)}{" "}
              <span className="text-lg text-gray-500">{item.unit}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ======================================================
          MAINTENANCE CALENDAR POPUP (NEW UI)
      ======================================================= */}
      <button
        onClick={() => setShowCalendar(true)}
        className="mt-12 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-lg hover:shadow-xl transition"
      >
        View Maintenance Calendar
      </button>

      <AnimatePresence>
        {showCalendar && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white p-8 rounded-2xl shadow-2xl w-96 border relative"
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.6, opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                📅 Maintenance Calendar
              </h3>

              <p>
                <strong>Last Maintenance:</strong> {data.last_checked}
              </p>
              <p className="mt-2">
                <strong>Next Service:</strong> {data.next_service}
              </p>

              <button
                onClick={() => setShowCalendar(false)}
                className="mt-6 px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 w-full transition"
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