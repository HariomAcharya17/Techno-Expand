import { motion } from "framer-motion";
import { FaLinkedin, FaGithub } from "react-icons/fa";

export default function OurTeam() {
  const team = [
    {
      name: "Hariom Acharya",
      role: "Full Stack Developer & Hardware Engineer",
      img: "/team/hariom.jpg",
      linkedin: "#",
      github: "#",
    },
    {
      name: "Kaushik Dalvi",
      role: "UI/UX Designer & Hardware Support",
      img: "/team/kaushik.jpg",
      linkedin: "#",
      github: "#",
    },
    {
      name: "Divya Balchandani",
      role: "Machine Learning Engineer",
      img: "/team/divya.jpg",
      linkedin: "#",
      github: "#",
    },
    {
      name: "Vraj Bagadiya",
      role: "UI Helper & Resource Management",
      img: "/team/vraj.jpg",
      linkedin: "#",
      github: "#",
    },
  ];

  return (
    <div className="ml-64 mt-20 p-10">
      {/* PAGE HEADER */}
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-4xl font-extrabold text-gray-900 mb-12"
      >
        Our Team
      </motion.h1>

      {/* GRID 2 × 2 */}
      <div className="grid grid-cols-2 gap-10">
        {team.map((member, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            whileHover={{ scale: 1.05, rotateX: 5, rotateY: 5 }}
            className="p-8 rounded-3xl shadow-xl bg-white/40 backdrop-blur-lg border border-white/30 hover:shadow-2xl transition-all flex flex-col items-center"
          >
            {/* GLOWING RING */}
            <div className="relative w-40 h-40 mb-6">
              {/* glow ring */}
              <motion.div
                className="absolute inset-0 rounded-full"
                animate={{
                  boxShadow: [
                    "0 0 10px rgba(147, 51, 234, 0.6)",
                    "0 0 25px rgba(147, 51, 234, 0.9)",
                    "0 0 10px rgba(147, 51, 234, 0.6)",
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />

              {/* profile img */}
              <div className="w-full h-full rounded-full overflow-hidden border-4 border-white shadow-xl">
                <img
                  src={member.img}
                  alt={member.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* NAME */}
            <h2 className="text-xl font-bold text-gray-900 text-center">
              {member.name}
            </h2>

            {/* ROLE */}
            <p className="text-blue-600 font-medium text-center mt-1">
              {member.role}
            </p>

            {/* SOCIAL ICONS */}
            <div className="flex gap-5 mt-4">
              <motion.a
                href={member.linkedin}
                target="_blank"
                whileHover={{ scale: 1.2 }}
                className="text-blue-700 text-2xl hover:drop-shadow-md"
              >
                <FaLinkedin />
              </motion.a>

              <motion.a
                href={member.github}
                target="_blank"
                whileHover={{ scale: 1.2 }}
                className="text-gray-900 text-2xl hover:drop-shadow-md"
              >
                <FaGithub />
              </motion.a>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}