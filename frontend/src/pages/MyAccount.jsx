import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export default function MyAccount() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // ⭐ Load real user data from LocalStorage when page opens
  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("user"));

    if (savedUser) {
      setName(savedUser.name || "");
      setEmail(savedUser.email || "");
      setPhone(savedUser.phone || "");
    }
  }, []);

  // ⭐ Save updated user info back to LocalStorage
  const handleSave = () => {
    const updatedUser = { name, email, phone };

    localStorage.setItem("user", JSON.stringify(updatedUser));
    alert("Account updated successfully!");
  };

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
          onClick={handleSave}
        >
          Save Changes
        </motion.button>
      </motion.div>

    </div>
  );
}