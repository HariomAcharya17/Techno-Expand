import { motion } from "framer-motion";
import BackButton from "../components/BackButton";

export default function OurTeam() {
  const team = [
    { name: "Hariom Acharya", role: "Team Leader / ML Engineer" },
    { name: "Member 2", role: "Backend Developer" },
    { name: "Member 3", role: "UI/Frontend Developer" },
  ];

  return (
    <div className="p-8 ml-64 mt-16">
      <BackButton />

      <motion.h1
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-4xl font-bold text-blue-700 mb-6"
      >
        Our Team
      </motion.h1>

      <div className="grid grid-cols-3 gap-6">
        {team.map((member, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.2 }}
            className="bg-white p-6 rounded-xl shadow hover:scale-105 transition-all text-center"
          >
            <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4"></div>
            <h2 className="font-bold text-xl">{member.name}</h2>
            <p className="text-gray-600">{member.role}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}