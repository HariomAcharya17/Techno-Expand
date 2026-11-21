import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { FiGrid, FiCpu, FiBell, FiDatabase, FiLayers, FiUsers, FiMenu, FiX, FiFileText } from "react-icons/fi";
import { useTelemetry } from "../sim/engine";

const NAV = [
  { group: "Operations", items: [
    { to: "/", label: "Overview", icon: FiGrid, end: true },
    { to: "/machines", label: "Assets", icon: FiCpu },
    { to: "/alerts", label: "Alarms", icon: FiBell, badge: true },
  ]},
  { group: "About the project", items: [
    { to: "/case-study", label: "Case study", icon: FiFileText },
    { to: "/dataset", label: "Dataset & model", icon: FiDatabase },
    { to: "/architecture", label: "System architecture", icon: FiLayers },
    { to: "/our-team", label: "Team", icon: FiUsers },
  ]},
];

function Clock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <span className="num text-xs text-white/70 hidden md:inline">
      {now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}{" "}
      {now.toLocaleTimeString("en-GB", { hour12: false })}
    </span>
  );
}

export default function Layout() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const t = useTelemetry();
  const unacked = t.alarms.filter((a) => !a.acked && a.severity === "crit").length;

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
      <div className="border-t border-line px-4 py-3 text-xs">
        <div className="mb-1.5 text-mute">Edge gateways</div>
        <div className="num grid grid-cols-2 gap-y-1 text-dim">
          <span>GW-01, GW-02</span><span className="text-right text-ok">online</span>
          <span>Latency</span><span className="text-right text-ink">{t.gateway.latency} ms</span>
          <span>Packets</span><span className="text-right text-ink">{t.gateway.packets.toLocaleString()}</span>
        </div>
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
        <span className="hidden sm:inline text-[13px] text-white/75">Plant 01 · Condition monitoring</span>
        <div className="ml-auto flex items-center gap-4">
          <Clock />
          <NavLink to="/dataset" className="text-xs text-white/75 hover:text-white underline-offset-2 hover:underline">
            Demo data
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
        <main className="mx-auto max-w-[1480px] px-4 py-5 sm:px-6">
          <Outlet />
        </main>
        <footer className="mx-auto max-w-[1480px] px-4 pb-6 sm:px-6 text-xs text-dim">
          TechnoExpand, Group 47, LDRP-ITR. Sensor data on this site is simulated in the browser.{" "}
          <NavLink to="/dataset" className="text-mute underline underline-offset-2 hover:text-ink">Why?</NavLink>
        </footer>
      </div>
    </div>
  );
}
