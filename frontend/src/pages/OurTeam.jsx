import { FaLinkedin, FaGithub } from "react-icons/fa";
import { PageHeader } from "../components/ui";

// Add real profile URLs here; icons only show when a URL is set.
const TEAM = [
  { name: "Hariom Acharya", role: "Web Developer & ML Data Engineer", img: "/team/hariom.jpg", linkedin: "", github: "" },
  { name: "Kaushik Dalvi", role: "UI/UX Designer & Hardware Support", img: "/team/kaushik.jpg", linkedin: "", github: "" },
  { name: "Divya Balchandani", role: "Machine Learning Engineer", img: "/team/divya.jpg", linkedin: "", github: "" },
  { name: "Vraj Bagadiya", role: "UI Helper & Resource Management", img: "/team/vraj.jpg", linkedin: "", github: "" },
];

export default function OurTeam() {
  return (
    <>
      <PageHeader title="Team" subtitle="Group 47 · LDRP Institute of Technology and Research (LDRP-ITR)" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {TEAM.map((m) => (
          <div key={m.name} className="rounded border border-line bg-panel p-5 text-center">
            <img src={m.img} alt={m.name} loading="lazy" className="mx-auto h-28 w-28 rounded-full border-2 border-line object-cover" />
            <h2 className="mt-4 font-semibold">{m.name}</h2>
            <p className="mt-1 text-sm text-mute">{m.role}</p>
            {(m.linkedin || m.github) && (
              <div className="mt-4 flex justify-center gap-4 text-lg text-mute">
                {m.linkedin && (
                  <a href={m.linkedin} target="_blank" rel="noreferrer" className="hover:text-accent" aria-label="LinkedIn">
                    <FaLinkedin />
                  </a>
                )}
                {m.github && (
                  <a href={m.github} target="_blank" rel="noreferrer" className="hover:text-ink" aria-label="GitHub">
                    <FaGithub />
                  </a>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
