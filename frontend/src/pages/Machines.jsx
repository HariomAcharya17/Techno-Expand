import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function Machines() {
  const [data, setData] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8000/ws/data");
    ws.onmessage = (e) => setData(JSON.parse(e.data));
    return () => ws.close();
  }, []);

  return (
    <div className="p-8 ml-64 mt-16">
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-4xl font-bold text-gray-800 mb-8"
      >
        All Machines
      </motion.h1>

      <div className="grid grid-cols-3 gap-8">
        {Object.entries(data).map(([id, m], index) => (
          <motion.div
            key={id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => navigate(`/machines/${id}`)}
            className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all cursor-pointer p-6 border border-gray-100"
          >
            {/* Machine Name */}
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              {m.name}
            </h2>

            {/* Status Badge */}
            <span
              className={`px-3 py-1 rounded-full text-white text-xs font-semibold
                ${
                  m.prediction === "Healthy"
                    ? "bg-green-500"
                    : m.prediction === "Medium"
                    ? "bg-yellow-500"
                    : "bg-red-500"
                }
              `}
            >
              {m.prediction}
            </span>

            {/* Image Placeholder */}
            <div className="w-full h-40 bg-gray-200 rounded-lg mt-4 flex items-center justify-center text-gray-500">
              Machine Image
            </div>

            {/* Health + Failure */}
            <div className="mt-5">
              <div className="flex justify-between text-gray-700">
                <p className="font-medium">Health</p>
                <p className="font-bold">{m.health}%</p>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div
                  className={`h-2 rounded-full ${
                    m.health > 70
                      ? "bg-green-500"
                      : m.health > 40
                      ? "bg-yellow-500"
                      : "bg-red-500"
                  }`}
                  style={{ width: `${m.health}%` }}
                ></div>
              </div>

              <div className="flex justify-between text-gray-700 mt-3">
                <p className="font-medium">Failure</p>
                <p className="font-bold">{m.failure}%</p>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div
                  className={`h-2 rounded-full ${
                    m.failure < 30
                      ? "bg-green-500"
                      : m.failure < 60
                      ? "bg-yellow-500"
                      : "bg-red-500"
                  }`}
                  style={{ width: `${m.failure}%` }}
                ></div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}