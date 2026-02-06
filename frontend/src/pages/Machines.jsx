import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function Machines() {
  const [machines, setMachines] = useState({});

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8000/ws/data");

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setMachines(data);
    };

    ws.onopen = () => console.log("Machines WS connected");

    return () => {
      if (ws.readyState === 1) ws.close(1000);
    };
  }, []);

  const statusColor = {
    Healthy: "bg-green-500",
    Medium: "bg-yellow-500",
    Fail: "bg-red-500",
  };

  return (
    <div className="ml-64 mt-20 p-10">
      <h1 className="text-4xl font-bold">Machines</h1>

      <div className="grid grid-cols-3 gap-8 mt-10">
        {Object.entries(machines).map(([id, m], index) => (
          <motion.div
            key={id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link
              to={`/machine/${id}`}
              className="block bg-white p-6 rounded-2xl shadow-lg border 
                       hover:shadow-2xl transition-all duration-300"
            >
              {/* MACHINE IMAGE */}
              <div className="w-full h-40 rounded-xl overflow-hidden mb-4 bg-gray-100">
                <img
  src={`/machines/${id}.jpg`}
  alt={m.name}
  className="w-full h-full object-cover"
  onError={(e) => (e.target.src = "/machines/default.jpg")}
/>
              </div>

              {/* MACHINE NAME */}
              <h2 className="text-xl font-semibold">{m.name}</h2>

              {/* CONDITION BADGE */}
              <div className="mt-2">
                <span
                  className={`text-white px-3 py-1 rounded-full text-sm ${statusColor[m.condition]}`}
                >
                  {m.condition}
                </span>
              </div>

              {/* DETAILS */}
              <div className="mt-4 text-gray-700 space-y-1">
                <p><strong>Health:</strong> {m.health}%</p>
                <p><strong>Failure %:</strong> {m.failure}%</p>
                <p><strong>Working Hours:</strong> {m.workingHours}</p>
                <p><strong>Next Service:</strong> {m.next_service}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}