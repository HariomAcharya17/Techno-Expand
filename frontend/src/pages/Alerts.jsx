import { useState } from "react";
import { Link } from "react-router-dom";
import { useReplay, acknowledge, fmtDay } from "../sim/replay";
import { Panel, PageHeader, ReplayLoading } from "../components/ui";
import { STATUS_COLOR } from "../lib/status";
import { eventText } from "../lib/events";

export default function Alerts() {
  const r = useReplay();
  const [sev, setSev] = useState("all");
  const [showAcked, setShowAcked] = useState(true);
  if (r.status !== "ready") return <ReplayLoading r={r} />;
  const { data, day, acked } = r;

  const rows = data.events.filter(
    (e) =>
      e.day <= day &&
      (sev === "all" || (sev === "failure" ? e.kind === "failure" : e.kind === sev)) &&
      (showAcked || !acked.has(e.id))
  );
  const unacked = rows.filter((e) => !acked.has(e.id)).map((e) => e.id);
  const color = (e) => STATUS_COLOR[e.kind === "failure" ? "failed" : e.severity];

  return (
    <>
      <PageHeader
        title="Alerts"
        subtitle={`Raised when model v2 moves a machine up to Warning or Critical, plus failures recorded in the data. Up to ${fmtDay(day)}.`}
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap rounded border border-line bg-panel p-0.5">
          {[
            ["all", "All"],
            ["crit", "Critical"],
            ["warn", "Warning"],
            ["failure", "Failures"],
          ].map(([k, l]) => (
            <button key={k} onClick={() => setSev(k)} className={`rounded px-3 py-1.5 text-xs font-medium ${sev === k ? "bg-accent text-white" : "text-mute hover:text-ink"}`}>
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
        {rows.length === 0 ? (
          <p className="px-4 py-8 text-center text-mute">No alerts.</p>
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-panel-2 text-left text-xs text-mute">
                    <th className="px-4 py-2.5 font-medium">Date</th>
                    <th className="px-3 py-2.5 font-medium">Alert</th>
                    <th className="px-3 py-2.5 font-medium">Machine</th>
                    <th className="px-3 py-2.5 text-right font-medium">State</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((e) => (
                    <tr key={e.id} className={`border-t border-line ${acked.has(e.id) ? "opacity-50" : ""}`}>
                      <td className="num whitespace-nowrap px-4 py-2.5 text-xs text-mute">{fmtDay(e.day)}</td>
                      <td className="px-3 py-2.5">
                        <span className="inline-flex items-center gap-2" style={{ color: color(e) }}>
                          <span className="h-2 w-2 rounded-full" style={{ background: color(e) }} />
                          <span className="font-medium">{eventText(e)}</span>
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5">
                        <Link to={`/machine/${e.device}`} className="hover:text-accent">
                          <span className="num mr-2 text-dim">{e.device}</span>
                          {e.name}
                        </Link>
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        {acked.has(e.id) ? (
                          <span className="text-xs text-dim">Acknowledged</span>
                        ) : (
                          <button onClick={() => acknowledge([e.id])} className="text-xs text-accent hover:underline">Acknowledge</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <ul className="divide-y divide-line md:hidden">
              {rows.map((e) => (
                <li key={e.id} className={`px-4 py-3 ${acked.has(e.id) ? "opacity-50" : ""}`}>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: color(e) }} />
                    <span className="font-medium" style={{ color: color(e) }}>{eventText(e)}</span>
                  </div>
                  <Link to={`/machine/${e.device}`} className="mt-0.5 block truncate text-xs text-mute">
                    {e.device} · {e.name}
                  </Link>
                  <div className="mt-1.5 flex items-center justify-between">
                    <span className="num text-[11px] text-dim">{fmtDay(e.day)}</span>
                    {acked.has(e.id) ? (
                      <span className="text-xs text-dim">Acknowledged</span>
                    ) : (
                      <button onClick={() => acknowledge([e.id])} className="py-1 text-xs text-accent">Acknowledge</button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </Panel>
    </>
  );
}
