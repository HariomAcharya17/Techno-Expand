import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { FiGrid, FiCpu, FiBell, FiDatabase, FiLayers, FiUsers, FiMenu, FiX, FiFileText, FiPlay, FiPause } from "react-icons/fi";
import { useReplay, togglePlay, setSpeed, seek, fmtDay } from "../sim/replay";

const NAV = [
  { group: "Operations", items: [
    { to: "/", label: "Overview", icon: FiGrid, end: true },
    { to: "/machines", label: "Machines", icon: FiCpu },
    { to: "/alerts", label: "Alerts", icon: FiBell, badge: true },
  ]},
  { group: "About the project", items: [
    { to: "/case-study", label: "Case study", icon: FiFileText },
    { to: "/dataset", label: "Dataset & model", icon: FiDatabase },
    { to: "/architecture", label: "System architecture", icon: FiLayers },
    { to: "/our-team", label: "Team", icon: FiUsers },
  ]},
];

const SPEEDS = [1, 5, 20];

function ReplayBar({ r }) {
  if (r.status === "loading") return <div className="border-b border-line bg-panel px-4 py-2 text-xs text-mute sm:px-6">Loading replay data…</div>;
  if (r.status === "error")
    return <div className="border-b border-line bg-panel px-4 py-2 text-xs text-crit sm:px-6">Could not load replay data ({r.error}).</div>;
  return (
    <div className="sticky top-12 z-20 border-b border-line bg-panel/95 backdrop-blur">
      <div className="mx-auto flex max-w-[1480px] flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2 sm:px-6">
        <div className="flex items-center gap-2">
          <button
            onClick={togglePlay}
            aria-label={r.playing ? "Pause replay" : "Play replay"}
            className="flex h-7 w-7 items-center justify-center rounded bg-accent text-white hover:opacity-90"
          >
            {r.playing ? <FiPause size={13} /> : <FiPlay size={13} />}
          </button>
          <div className="leading-tight">
            <div className="num text-sm font-medium">{fmtDay(r.day)}</div>
            <div className="text-[11px] text-dim">Replay · 1 day every {2 / r.speed} s</div>
          </div>
        </div>
        <div className="flex rounded border border-line text-xs">
          {SPEEDS.map((sp) => (
            <button
              key={sp}
              onClick={() => setSpeed(sp)}
              className={`num px-2 py-1 ${r.speed === sp ? "bg-accent text-white" : "text-mute hover:text-ink"}`}
            >
              {sp}×
            </button>
          ))}
        </div>
        <input
          type="range"
          min={0}
          max={r.data.endDay}
          value={r.day}
          onChange={(e) => seek(Number(e.target.value))}
          aria-label="Replay date"
          className="h-1 min-w-[160px] flex-1 accent-[#0b5cad]"
        />
        <span className="num hidden text-[11px] text-dim md:inline">01 Jan – {fmtDay(r.data.endDay)}</span>
      </div>
    </div>
  );
}

export default function Layout() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const r = useReplay();
  const unacked = r.data ? r.data.events.filter((e) => e.day <= r.day && e.severity === "crit" && !r.acked.has(e.id)).length : 0;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const nav = (
    <nav className="flex h-full w-56 flex-col border-r border-line bg-panel">
      <div className="flex-1 overflow-y-auto py-3">
        {NAV.map((g) => (
          <div key={g.group} className="mb-4">
            <div className="px-4 pb-1 text-xs text-dim">{g.group}</div>
            {g.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 border-l-[3px] px-4 py-2 text-[13px] ${
                    isActive
                      ? "border-accent bg-[#eaf1f8] font-medium text-ink"
                      : "border-transparent text-mute hover:bg-panel-2 hover:text-ink"
                  }`
                }
              >
                <item.icon className="shrink-0" size={15} />
                <span className="flex-1">{item.label}</span>
                {item.badge && unacked > 0 && (
                  <span className="num min-w-5 bg-crit px-1 text-center text-[11px] text-white">{unacked}</span>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </div>
      <div className="border-t border-line px-4 py-3 text-xs leading-relaxed text-dim">
        <div className="mb-1 text-mute">Data source</div>
        Real daily readings of 15 machines from the Kaggle dataset, with predictions from model v2. None of these
        machines were used in training.
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen">
      <header className="fixed inset-x-0 top-0 z-40 flex h-12 items-center gap-3 bg-head px-4 text-white">
        <button className="lg:hidden text-white/80" onClick={() => setOpen((o) => !o)} aria-label="Menu">
          {open ? <FiX size={20} /> : <FiMenu size={20} />}
        </button>
        <span className="font-semibold tracking-tight">TechnoExpand</span>
        <span className="hidden sm:inline h-4 w-px bg-white/25" />
        <span className="hidden sm:inline text-[13px] text-white/75">Condition monitoring · model v2 replay</span>
        <div className="ml-auto flex items-center gap-4">
          <NavLink to="/dataset" className="text-xs text-white/75 hover:text-white underline-offset-2 hover:underline">
            About the data
          </NavLink>
        </div>
      </header>

      <div className="fixed bottom-0 left-0 top-12 z-30 hidden lg:block">{nav}</div>
      {open && (
        <div className="fixed inset-0 top-12 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/25" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0">{nav}</div>
        </div>
      )}

      <div className="pt-12 lg:pl-56">
        <ReplayBar r={r} />
        <main className="mx-auto max-w-[1480px] px-4 py-5 sm:px-6">
          <Outlet />
        </main>
        <footer className="mx-auto max-w-[1480px] px-4 pb-6 sm:px-6 text-xs text-dim">
          TechnoExpand, Group 47, LDRP-ITR. Readings and predictions are real (Kaggle dataset + model v2), replayed
          day by day. Asset names and photos are illustrative.{" "}
          <NavLink to="/case-study" className="text-mute underline underline-offset-2 hover:text-ink">Case study</NavLink>
        </footer>
      </div>
    </div>
  );
}
