import { motion } from "framer-motion";
import BackButton from "../components/BackButton";

export default function MyAccount() {
  return (
    <div className="p-8 ml-64 mt-16">
      <BackButton />

      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-4xl font-bold mb-6 text-purple-700"
      >
        My Account
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-6 rounded-xl shadow max-w-xl"
      >
        <div className="flex items-center gap-6 mb-6">
          <div className="w-24 h-24 bg-gray-200 rounded-full"></div>
          <div>
            <h2 className="text-2xl font-bold">Hariom Acharya</h2>
            <p className="text-gray-600">Admin / Machine Learning Engineer</p>
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-gray-700">Email: hariom@example.com</p>
          <p className="text-gray-700">Role: System Administrator</p>
          <button className="mt-4 px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600">
            Logout
          </button>
        </div>
      </motion.div>
    </div>
  );
}