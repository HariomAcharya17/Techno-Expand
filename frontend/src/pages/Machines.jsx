import { useState } from "react";
import { Link } from "react-router-dom";
import { FiSearch } from "react-icons/fi";
import { useTelemetry } from "../sim/engine";
import { MACHINES, SENSOR_BY_KEY, sensorState } from "../sim/config";
import { StatusBadge, HealthBar, Sparkline, PageHeader } from "../components/ui";
import { STATUS_COLOR } from "../lib/status";

const FILTERS = [
  ["all", "All"],
  ["ok", "Healthy"],
  ["warn", "Warning"],
  ["crit", "Critical"],
];

function Metric({ k, v }) {
  const def = SENSOR_BY_KEY[k];
  const st = sensorState(def, v);
  return (
    <div>
      <div className="text-[10px] text-dim">{def.label}</div>
      <div className="num text-sm" style={{ color: st === "ok" ? undefined : STATUS_COLOR[st] }}>
        {v.toFixed(1)} <span className="text-dim text-xs">{def.unit}</span>
      </div>
    </div>
  );
}

export default function Machines() {
  const t = useTelemetry();
  const [filter, setFilter] = useState("all");
  const [q, setQ] = useState("");

  const list = MACHINES.map((m) => t.machines[m.id]).filter(
    (m) =>
      (filter === "all" || m.status === filter) &&
      (q === "" || `${m.id} ${m.name} ${m.line} ${m.area}`.toLowerCase().includes(q.toLowerCase()))
  );

  return (
    <>
      <PageHeader title="Assets" subtitle="Every asset carries one ESP32 sensor node streaming 9 channels." />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex rounded border border-line bg-panel p-0.5">
          {FILTERS.map(([k, l]) => (
            <button
              key={k}
              onClick={() => setFilter(k)}
              className={`rounded px-3 py-1.5 text-xs font-medium transition-colors ${
                filter === k ? "bg-accent text-white" : "text-mute hover:text-ink"
              }`}
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
            placeholder="Search asset, line, area"
            className="w-full rounded border border-line bg-panel py-2 pl-9 pr-3 text-sm text-ink placeholder:text-dim focus:border-accent/60 focus:outline-none"
          />
        </label>
      </div>

      {list.length === 0 && <p className="text-sm text-mute">No assets match.</p>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {list.map((m) => (
          <Link
            key={m.id}
            to={`/machine/${m.id}`}
            className="group overflow-hidden rounded border border-line bg-panel transition-colors hover:border-accent/40"
          >
            <div className="h-32 border-b border-line bg-panel-2">
              <img
                src={`/machines/${m.id}.jpg`}
                alt={m.name}
                loading="lazy"
                className="h-full w-full object-cover"
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="truncate font-medium text-ink">{m.name}</h3>
                  <p className="num text-[11px] text-dim">
                    {m.id} · {m.line} · {m.area}
                  </p>
                  <div className="mt-1.5"><StatusBadge status={m.status} condition={m.condition} /></div>
                </div>
                <Sparkline data={m.series.health.slice(-30)} color={STATUS_COLOR[m.status]} width={70} height={24} />
              </div>
              <div className="mt-3">
                <div className="mb-1 flex justify-between text-[11px] text-dim">
                  <span>Health</span>
                  <span>RUL <span className="num text-mute">{m.rul.toFixed(1)} d</span></span>
                </div>
                <HealthBar value={m.health} status={m.status} />
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 border-t border-line pt-3">
                <Metric k="temperature" v={m.sensor.temperature} />
                <Metric k="vibration" v={m.sensor.vibration} />
                <Metric k="current" v={m.sensor.current} />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
