import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Line } from "react-chartjs-2";
import { FiArrowLeft, FiDownload, FiAlertTriangle, FiTool } from "react-icons/fi";
import { useTelemetry } from "../sim/engine";
import { SENSORS, sensorState } from "../sim/config";
import { Panel, Kpi, StatusBadge, Sparkline } from "../components/ui";
import { STATUS_COLOR } from "../lib/status";
import { fmtTime, lineOptions } from "../lib/chart";

function limitText(def) {
  const parts = [];
  if (def.warnLo != null) parts.push(`${def.warnLo}–${def.warnHi}`);
  else parts.push(`< ${def.warnHi}`);
  return `Normal ${parts.join("")} ${def.unit}`;
}

export default function MachineDetails() {
  const { id } = useParams();
  const t = useTelemetry();
  const m = t.machines[id];
  const [exporting, setExporting] = useState(false);

  if (!m) {
    return (
      <div className="py-20 text-center">
        <p className="text-mute">Asset “{id}” not found.</p>
        <Link to="/machines" className="mt-3 inline-block text-sm text-accent hover:underline">
          Back to assets
        </Link>
      </div>
    );
  }

  const machineAlarms = t.alarms.filter((a) => a.machineId === id).slice(0, 8);

  const exportToExcel = async () => {
    setExporting(true);
    try {
      const XLSX = await import("xlsx");
      const wb = XLSX.utils.book_new();
      const summary = [
        ["Asset ID", m.id],
        ["Name", m.name],
        ["Line / Area", `${m.line} / ${m.area}`],
        ["Sensor node", m.node],
        ["Condition (ML class)", m.condition],
        ["Health (%)", m.health],
        ["Failure probability (%)", m.failure],
        ["RUL (days)", Number(m.rul.toFixed(1))],
        ["Working hours", Math.round(m.workingHours)],
        ["Last service", m.lastChecked],
        ["Next service", m.nextService],
        ["Exported", new Date().toISOString()],
        [],
        ["Sensor", "Value", "Unit", "State"],
        ...SENSORS.map((s) => [s.label, m.sensor[s.key], s.unit, sensorState(s, m.sensor[s.key])]),
      ];
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(summary), "Summary");
      const ts = [
        ["Timestamp", "Health %", ...SENSORS.map((s) => `${s.label} (${s.unit})`)],
        ...t.times.map((time, i) => [
          new Date(time).toISOString(),
          m.series.health[i],
          ...SENSORS.map((s) => m.series[s.key][i]),
        ]),
      ];
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(ts), "Telemetry");
      XLSX.utils.book_append_sheet(
        wb,
        XLSX.utils.json_to_sheet(m.maintenanceHistory),
        "Maintenance"
      );
      XLSX.writeFile(wb, `${m.id}_${m.name.replace(/\s+/g, "_")}_telemetry.xlsx`);
    } finally {
      setExporting(false);
    }
  };

  return (
    <>
      <Link to="/machines" className="mb-4 inline-flex items-center gap-1.5 text-sm text-mute hover:text-ink">
        <FiArrowLeft size={14} /> Assets
      </Link>

      {/* Header */}
      <div className="flex flex-col gap-4 rounded border border-line bg-panel p-4 md:flex-row md:items-center">
        <div className="h-24 w-full overflow-hidden rounded bg-panel-2 md:w-40 shrink-0">
          <img
            src={`/machines/${m.id}.jpg`}
            alt={m.name}
            className="h-full w-full object-cover"
            onError={(e) => (e.currentTarget.style.display = "none")}
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-semibold">{m.name}</h1>
            <StatusBadge status={m.status} condition={m.condition} size="lg" />
          </div>
          <dl className="num mt-2 grid grid-cols-2 gap-x-6 gap-y-1 text-xs sm:grid-cols-4">
            {[
              ["Asset", m.id],
              ["Location", `${m.line} · ${m.area}`],
              ["Sensor node", `${m.node} · ${m.firmware}`],
              ["Gateway", `${m.gateway} · ${t.gateway.latency} ms`],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="text-dim">{k}</dt>
                <dd className="text-mute truncate">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
        <button
          onClick={exportToExcel}
          disabled={exporting}
          className="inline-flex items-center justify-center gap-2 rounded border border-line bg-panel-2 px-3 py-2 text-sm text-ink hover:border-accent/50 disabled:opacity-50"
        >
          <FiDownload size={14} /> {exporting ? "Exporting…" : "Export .xlsx"}
        </button>
      </div>

      {m.condition === "Fail" && (
        <div className="mt-4 flex gap-3 rounded border border-crit/40 bg-crit/10 p-4 text-sm">
          <FiAlertTriangle className="mt-0.5 shrink-0 text-crit" size={18} />
          <div>
            <p className="font-medium text-crit">Failure predicted — schedule service immediately.</p>
            <p className="mt-1 text-mute">
              Before dispatching maintenance, rule out human error: check power supply, main switch status, cable wiring
              integrity and loose connectors.
            </p>
          </div>
        </div>
      )}

      {/* KPIs */}
      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        <Kpi label="Health index" value={m.health.toFixed(1)} unit="%" tone={m.status} />
        <Kpi label="Failure probability" value={m.failure.toFixed(1)} unit="%" tone={m.status === "ok" ? undefined : m.status} />
        <Kpi label="Remaining useful life" value={m.rul.toFixed(1)} unit="days" tone={m.status} />
        <Kpi label="Operating hours" value={Math.round(m.workingHours).toLocaleString()} unit="h" />
        <Kpi label="Next service" value={m.nextService} sub={`Last: ${m.lastChecked}`} />
      </div>

      {/* Trend + alarms */}
      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Panel title="Health index · live" className="xl:col-span-2">
          <div className="h-64">
            <Line
              data={{
                labels: t.times.map(fmtTime),
                datasets: [
                  {
                    label: "Health",
                    data: m.series.health,
                    borderColor: STATUS_COLOR[m.status],
                    backgroundColor: STATUS_COLOR[m.status] + "18",
                    fill: true,
                    borderWidth: 2,
                    tension: 0.3,
                  },
                ],
              }}
              options={lineOptions({ min: 0, max: 100, unit: "%" })}
            />
          </div>
        </Panel>
        <Panel title="Asset alarms" pad={false}>
          {machineAlarms.length === 0 ? (
            <p className="px-4 py-6 text-sm text-mute">No alarms raised for this asset.</p>
          ) : (
            <ul className="divide-y divide-line">
              {machineAlarms.map((a) => {
                const def = SENSORS.find((s) => s.key === a.sensor);
                return (
                  <li key={a.id} className="flex items-center gap-3 px-4 py-2.5 text-sm">
                    <span className="h-2 w-2 rounded-full" style={{ background: STATUS_COLOR[a.severity] }} />
                    <span className="flex-1 text-ink">{def.label}</span>
                    <span className="num text-xs text-mute">
                      {a.value} {def.unit}
                    </span>
                    <span className="num text-[11px] text-dim">{fmtTime(a.ts)}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>
      </div>

      {/* Sensors */}
      <h2 className="mb-3 mt-6 text-[13px] font-semibold">Sensor channels</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {SENSORS.map((s) => {
          const v = m.sensor[s.key];
          const st = sensorState(s, v);
          const c = STATUS_COLOR[st];
          return (
            <div key={s.key} className="rounded border border-line bg-panel p-4" style={{ borderLeft: `3px solid ${c}` }}>
              <div className="flex items-center justify-between">
                <span className="text-xs text-mute">{s.label}</span>
                <span className="text-[11px] font-medium" style={{ color: c }}>
                  {st === "ok" ? "Normal" : st === "warn" ? "Warning" : "Critical"}
                </span>
              </div>
              <div className="mt-2 flex items-end justify-between gap-3">
                <div>
                  <span className="num text-2xl font-semibold">{v.toFixed(s.key === "rpm" || s.key === "voltage" ? 0 : 2)}</span>
                  <span className="ml-1 text-sm text-mute">{s.unit}</span>
                </div>
                <Sparkline data={m.series[s.key]} color={c} width={120} height={34} />
              </div>
              <div className="mt-2 text-[11px] text-dim">{limitText(s)}</div>
            </div>
          );
        })}
      </div>

      {/* Maintenance */}
      <Panel title="Maintenance log" className="mt-6" pad={false} action={<FiTool className="text-dim" size={14} />}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-mute bg-panel-2">
                <th className="px-4 py-2.5 font-medium">Date</th>
                <th className="px-3 py-2.5 font-medium">Work order</th>
                <th className="px-3 py-2.5 font-medium">Engineer</th>
                <th className="px-3 py-2.5 font-medium">Notes</th>
              </tr>
            </thead>
            <tbody>
              {m.maintenanceHistory.map((h, i) => (
                <tr key={i} className="border-t border-line">
                  <td className="num px-4 py-2.5 text-xs text-mute whitespace-nowrap">{h.date}</td>
                  <td className="px-3 py-2.5 whitespace-nowrap">{h.event}</td>
                  <td className="px-3 py-2.5 text-mute whitespace-nowrap">{h.engineer}</td>
                  <td className="px-3 py-2.5 text-mute">{h.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  );
}
