import { useState } from "react";
import { Link } from "react-router-dom";
import { useTelemetry, acknowledge } from "../sim/engine";
import { SENSOR_BY_KEY } from "../sim/config";
import { Panel, PageHeader } from "../components/ui";
import { STATUS_COLOR } from "../lib/status";

const fmt = (t) =>
  new Date(t).toLocaleString([], { month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });

export default function Alerts() {
  const t = useTelemetry();
  const [sev, setSev] = useState("all");
  const [showAcked, setShowAcked] = useState(true);

  const rows = t.alarms.filter((a) => (sev === "all" || a.severity === sev) && (showAcked || !a.acked));
  const unacked = rows.filter((a) => !a.acked).map((a) => a.id);

  return (
    <>
      <PageHeader
        title="Alarm console"
        subtitle="Threshold alarms raised by the edge nodes. New alarms appear when a channel escalates to warning or critical."
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex rounded border border-line bg-panel p-0.5">
          {[
            ["all", "All"],
            ["crit", "Critical"],
            ["warn", "Warning"],
          ].map(([k, l]) => (
            <button
              key={k}
              onClick={() => setSev(k)}
              className={`rounded px-3 py-1.5 text-xs font-medium ${sev === k ? "bg-accent text-white" : "text-mute hover:text-ink"}`}
            >
              {l}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-xs text-mute">
          <input type="checkbox" checked={showAcked} onChange={(e) => setShowAcked(e.target.checked)} className="accent-[#0b5cad]" />
          Show acknowledged
        </label>
        <button
          disabled={!unacked.length}
          onClick={() => acknowledge(unacked)}
          className="ml-auto rounded border border-line bg-panel px-3 py-1.5 text-xs text-ink hover:border-accent/50 disabled:opacity-40"
        >
          Acknowledge all ({unacked.length})
        </button>
      </div>

      <Panel pad={false}>
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-mute bg-panel-2">
                <th className="px-4 py-2.5 font-medium">Time</th>
                <th className="px-3 py-2.5 font-medium">Severity</th>
                <th className="px-3 py-2.5 font-medium">Asset</th>
                <th className="px-3 py-2.5 font-medium">Channel</th>
                <th className="px-3 py-2.5 font-medium text-right">Value</th>
                <th className="px-3 py-2.5 font-medium text-right">State</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((a) => {
                const def = SENSOR_BY_KEY[a.sensor];
                return (
                  <tr key={a.id} className={`border-t border-line ${a.acked ? "opacity-50" : ""}`}>
                    <td className="num px-4 py-2.5 text-xs text-mute whitespace-nowrap">{fmt(a.ts)}</td>
                    <td className="px-3 py-2.5">
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium" style={{ color: STATUS_COLOR[a.severity] }}>
                        <span className="h-2 w-2 rounded-full" style={{ background: STATUS_COLOR[a.severity] }} />
                        {a.severity === "crit" ? "Critical" : "Warning"}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <Link to={`/machine/${a.machineId}`} className="hover:text-accent">
                        <span className="num text-dim mr-2">{a.machineId}</span>
                        {a.machine}
                      </Link>
                    </td>
                    <td className="px-3 py-2.5 text-mute">{def.label}</td>
                    <td className="num px-3 py-2.5 text-right text-xs whitespace-nowrap">
                      {a.value} <span className="text-dim">{def.unit}</span>
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      {a.acked ? (
                        <span className="text-xs text-dim">Acknowledged</span>
                      ) : (
                        <button onClick={() => acknowledge([a.id])} className="text-xs text-accent hover:underline">
                          Acknowledge
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-mute">
                    No alarms.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <ul className="divide-y divide-line md:hidden">
          {rows.map((a) => {
            const def = SENSOR_BY_KEY[a.sensor];
            return (
              <li key={a.id} className={`px-4 py-3 ${a.acked ? "opacity-50" : ""}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: STATUS_COLOR[a.severity] }} />
                      <span className="font-medium" style={{ color: STATUS_COLOR[a.severity] }}>
                        {a.severity === "crit" ? "Critical" : "Warning"}
                      </span>
                      <span className="text-ink">{def.label}</span>
                    </div>
                    <Link to={`/machine/${a.machineId}`} className="mt-0.5 block truncate text-xs text-mute">
                      {a.machineId} · {a.machine}
                    </Link>
                  </div>
                  <span className="num shrink-0 text-xs">
                    {a.value} <span className="text-dim">{def.unit}</span>
                  </span>
                </div>
                <div className="mt-1.5 flex items-center justify-between">
                  <span className="num text-[11px] text-dim">{fmt(a.ts)}</span>
                  {a.acked ? (
                    <span className="text-xs text-dim">Acknowledged</span>
                  ) : (
                    <button onClick={() => acknowledge([a.id])} className="py-1 text-xs text-accent">
                      Acknowledge
                    </button>
                  )}
                </div>
              </li>
            );
          })}
          {rows.length === 0 && <li className="px-4 py-8 text-center text-mute">No alarms.</li>}
        </ul>
      </Panel>
    </>
  );
}
