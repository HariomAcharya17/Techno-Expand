import { motion } from "framer-motion";
import { useState } from "react";

export default function MyAccount() {
  const [name, setName] = useState("Hariom Acharya");
  const [email, setEmail] = useState("hariom@example.com");
  const [phone, setPhone] = useState("9876543210");

  return (
    <div className="ml-64 mt-20 p-10">

      <motion.h1
        className="text-4xl font-bold mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        My Account
      </motion.h1>

      <motion.div
        className="backdrop-blur-xl bg-white/40 border border-white/60 p-8 rounded-3xl shadow-xl max-w-xl"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        {/* NAME */}
        <label className="font-medium text-gray-700">Name</label>
        <input
          className="w-full p-3 mt-1 rounded-xl border"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        {/* EMAIL */}
        <label className="font-medium text-gray-700 mt-4 block">Email</label>
        <input
          className="w-full p-3 mt-1 rounded-xl border"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* PHONE */}
        <label className="font-medium text-gray-700 mt-4 block">Phone</label>
        <input
          className="w-full p-3 mt-1 rounded-xl border"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <motion.button
          className="mt-6 w-full py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700"
          whileTap={{ scale: 0.95 }}
        >
          Save Changes
        </motion.button>
      </motion.div>

    </div>
  );
}