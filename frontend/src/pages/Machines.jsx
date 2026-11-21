import { useState } from "react";
import { Link } from "react-router-dom";
import { FiSearch } from "react-icons/fi";
import { useReplay, machineAt, fmtDay } from "../sim/replay";
import { StatusBadge, HealthBar, Sparkline, PageHeader, ReplayLoading } from "../components/ui";
import { STATUS_COLOR } from "../lib/status";
import { fmtRul } from "../lib/events";

const FILTERS = [
  ["all", "All"],
  ["ok", "Healthy"],
  ["warn", "Warning"],
  ["crit", "Critical"],
  ["failed", "Failed"],
];

export default function Machines() {
  const r = useReplay();
  const [filter, setFilter] = useState("all");
  const [q, setQ] = useState("");
  if (r.status !== "ready") return <ReplayLoading r={r} />;
  const { data, day } = r;

  const list = data.machines
    .map((m) => ({ m, s: machineAt(m, day) }))
    .filter(
      ({ m, s }) =>
        (filter === "all" || s.status === filter) &&
        (q === "" || `${m.slot} ${m.name} ${m.device}`.toLowerCase().includes(q.toLowerCase()))
    );

  return (
    <>
      <PageHeader
        title="Machines"
        subtitle={`Model v2 output for ${fmtDay(day)}. Device IDs and readings are from the dataset; names and photos are illustrative.`}
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex flex-wrap rounded border border-line bg-panel p-0.5">
          {FILTERS.map(([k, l]) => (
            <button
              key={k}
              onClick={() => setFilter(k)}
              className={`rounded px-3 py-1.5 text-xs font-medium transition-colors ${filter === k ? "bg-accent text-white" : "text-mute hover:text-ink"}`}
            >
              {l}
            </button>
          ))}
        </div>
        <label className="relative sm:ml-auto sm:w-72">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-dim" size={14} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name or device ID"
            className="w-full rounded border border-line bg-panel py-2 pl-9 pr-3 text-sm text-ink placeholder:text-dim focus:border-accent/60 focus:outline-none"
          />
        </label>
      </div>

      {list.length === 0 && <p className="text-sm text-mute">No machines match.</p>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {list.map(({ m, s }) => (
          <Link key={m.id} to={`/machine/${m.id}`} className="overflow-hidden rounded border border-line bg-panel transition-colors hover:border-accent/40">
            <div className="h-32 border-b border-line bg-panel-2">
              <img src={m.image} alt="" loading="lazy" className="h-full w-full object-cover" onError={(e) => (e.currentTarget.style.display = "none")} />
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="truncate font-medium text-ink">{m.name}</h3>
                  <p className="num text-[11px] text-dim">{m.slot} · {m.device}</p>
                  <div className="mt-1.5"><StatusBadge status={s.status} /></div>
                </div>
                {s.k >= 0 && <Sparkline data={m.p.slice(Math.max(0, s.k - 29), s.k + 1).map((p) => 100 - p / 10)} color={STATUS_COLOR[s.status]} width={70} height={24} />}
              </div>
              {s.status === "offline" ? (
                <p className="mt-3 text-xs text-dim">No readings yet on this date.</p>
              ) : s.status === "failed" ? (
                <p className="mt-3 border-t border-line pt-3 text-xs text-mute">
                  Failure recorded on <span className="num text-ink">{fmtDay(s.failedOn)}</span>. No readings since.
                </p>
              ) : (
                <>
                  <div className="mt-3">
                    <div className="mb-1 flex justify-between text-[11px] text-dim">
                      <span>Health</span>
                      <span>Failure risk <span className="num text-mute">{s.prob.toFixed(1)}%</span></span>
                    </div>
                    <HealthBar value={s.health} status={s.status} />
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 border-t border-line pt-3 text-[11px] text-dim">
                    <div>
                      Predicted RUL
                      <div className="num text-sm text-ink">{fmtRul(s.rul)} days</div>
                    </div>
                    <div>
                      Last reading
                      <div className="num text-sm text-ink">{fmtDay(s.lastDay)}</div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
