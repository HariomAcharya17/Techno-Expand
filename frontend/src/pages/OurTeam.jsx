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
      bg: "bg-[#f0f7ff]", // soft blue
    },
    {
      name: "Kaushik Dalvi",
      role: "UI/UX Designer & Hardware Support",
      img: "/team/kaushik.jpg",
      linkedin: "#",
      github: "#",
      bg: "bg-[#f8f2ff]", // lavender
    },
    {
      name: "Divya Balchandani",
      role: "Machine Learning Engineer",
      img: "/team/divya.jpg",
      linkedin: "#",
      github: "#",
      bg: "bg-[#fef7f0]", // sand
    },
    {
      name: "Vraj Bagadiya",
      role: "UI Helper & Resource Management",
      img: "/team/vraj.jpg",
      linkedin: "#",
      github: "#",
      bg: "bg-[#f3fff5]", // mint
    },
  ];

  return (
    <div className="ml-64 mt-20 p-10 bg-gray-50 min-h-screen text-gray-800">

      {/* HEADER — Soft Gradient */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="
          rounded-3xl px-10 py-10
          bg-gradient-to-r from-[#eef5ff] via-[#f4eeff] to-[#eef5ff]
          border border-gray-200 shadow-md
          flex items-center justify-between relative
          mb-12
        "
      >
        <h1 className="text-4xl font-extrabold text-gray-900">Our Team</h1>

        <motion.span
          className="absolute right-6 top-6 text-4xl opacity-80"
          animate={{ y: [0, -6, 0], opacity: [1, 0.85, 1] }}
          transition={{ repeat: Infinity, duration: 3.5 }}
        >
          👥
        </motion.span>
      </motion.div>

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {team.map((member, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            whileHover={{ scale: 1.03 }}
            className={`
              p-8 rounded-2xl shadow-lg border border-gray-200
              hover:shadow-xl transition-all duration-300
              flex flex-col items-center
              ${member.bg}
            `}
          >
            {/* Profile Image */}
            <div className="w-36 h-36 rounded-full overflow-hidden shadow-md border-4 border-white">
              <img
                src={member.img}
                alt={member.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Name */}
            <h2 className="text-2xl font-semibold text-gray-900 mt-4">
              {member.name}
            </h2>

            {/* Role */}
            <p className="text-blue-600 font-medium text-center mt-1">
              {member.role}
            </p>

            {/* Icons */}
            <div className="flex gap-6 mt-5">
              <motion.a
                href={member.linkedin}
                target="_blank"
                whileHover={{ scale: 1.15 }}
                className="text-blue-700 text-2xl hover:drop-shadow-md"
              >
                <FaLinkedin />
              </motion.a>

              <motion.a
                href={member.github}
                target="_blank"
                whileHover={{ scale: 1.15 }}
                className="text-gray-900 text-2xl hover:drop-shadow-md"
              >
                <FaGithub />
              </motion.a>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-20 h-16 bg-gradient-to-b from-transparent to-gray-100 rounded-xl"></div>
    </div>
  );
}