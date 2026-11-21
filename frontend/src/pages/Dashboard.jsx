import { Link } from "react-router-dom";
import { Line, Doughnut } from "react-chartjs-2";
import { FiArrowRight, FiInfo } from "react-icons/fi";
import { useTelemetry } from "../sim/engine";
import { MACHINES, SENSOR_BY_KEY, sensorState } from "../sim/config";
import { Panel, Kpi, StatusBadge, HealthBar, Sparkline, PageHeader } from "../components/ui";
import { STATUS_COLOR } from "../lib/status";
import { fmtTime, lineOptions } from "../lib/chart";

function SensorCell({ k, v }) {
  const def = SENSOR_BY_KEY[k];
  const st = sensorState(def, v);
  return (
    <span className="num text-xs" style={{ color: st === "ok" ? undefined : STATUS_COLOR[st] }}>
      {v.toFixed(1)}
      <span className="text-dim ml-0.5">{def.unit}</span>
    </span>
  );
}

export default function Dashboard() {
  const t = useTelemetry();
  const list = MACHINES.map((m) => t.machines[m.id]);
  const counts = { ok: 0, warn: 0, crit: 0 };
  list.forEach((m) => counts[m.status]++);
  const avg = t.fleet[t.fleet.length - 1];
  const minRul = list.reduce((a, b) => (b.rul < a.rul ? b : a));
  const activeAlarms = Object.values(t.active).filter((s) => s !== "ok").length;
  const sorted = [...list].sort((a, b) => a.health - b.health);

  return (
    <>
      <PageHeader
        title="Plant Overview"
        subtitle="Condition monitoring for 15 assets across 4 production lines. Updates every 2 s."
        right={
          <Link
            to="/dataset"
            className="inline-flex items-center gap-2 rounded border border-line bg-panel px-3 py-2 text-xs text-mute hover:text-ink"
          >
            <FiInfo size={14} /> Demo data &amp; model details
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <Kpi label="Fleet health" value={avg.toFixed(1)} unit="%" sub="Average of all assets" tone={avg > 80 ? "ok" : avg > 50 ? "warn" : "crit"} />
        <Kpi label="Assets online" value={`${list.length}/${list.length}`} sub="2 edge gateways" />
        <Kpi label="Healthy" value={counts.ok} tone="ok" sub="Within normal limits" />
        <Kpi label="Warning" value={counts.warn} tone="warn" sub="Monitor closely" />
        <Kpi label="Critical" value={counts.crit} tone="crit" sub="Service required" />
        <Kpi label="Lowest RUL" value={minRul.rul.toFixed(1)} unit="days" sub={`${minRul.id} · ${minRul.name}`} tone="crit" />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Panel
          title="Fleet health trend"
          className="xl:col-span-2"
          action={<span className="num text-xs text-dim">last {t.fleet.length * 2} s</span>}
        >
          <div className="h-64">
            <Line
              data={{
                labels: t.times.map(fmtTime),
                datasets: [
                  {
                    label: "Avg health",
                    data: t.fleet,
                    borderColor: "#0b5cad",
                    backgroundColor: "rgba(11,92,173,0.06)",
                    fill: true,
                    borderWidth: 2,
                    tension: 0.3,
                  },
                ],
              }}
              options={lineOptions({ unit: "%" })}
            />
          </div>
        </Panel>

        <Panel title="Asset status">
          <div className="flex items-center gap-6">
            <div className="relative h-44 w-44 shrink-0">
              <Doughnut
                data={{
                  labels: ["Healthy", "Warning", "Critical"],
                  datasets: [
                    {
                      data: [counts.ok, counts.warn, counts.crit],
                      backgroundColor: [STATUS_COLOR.ok, STATUS_COLOR.warn, STATUS_COLOR.crit],
                      borderColor: "#ffffff",
                      borderWidth: 3,
                    },
                  ],
                }}
                options={{ cutout: "72%", plugins: { legend: { display: false } }, maintainAspectRatio: false }}
              />
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="num text-2xl font-semibold">{list.length}</span>
                <span className="text-[11px] text-mute">assets</span>
              </div>
            </div>
            <ul className="space-y-3 text-sm flex-1">
              {[
                ["ok", "Healthy", counts.ok],
                ["warn", "Warning", counts.warn],
                ["crit", "Critical", counts.crit],
              ].map(([k, l, n]) => (
                <li key={k} className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-sm" style={{ background: STATUS_COLOR[k] }} />
                  <span className="text-mute flex-1">{l}</span>
                  <span className="num">{n}</span>
                </li>
              ))}
              <li className="flex items-center gap-2 border-t border-line pt-3">
                <span className="text-mute flex-1">Active alarms</span>
                <span className="num text-crit">{activeAlarms}</span>
              </li>
            </ul>
          </div>
        </Panel>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Panel
          title="Asset condition"
          className="xl:col-span-2"
          pad={false}
          action={
            <Link to="/machines" className="text-xs text-accent hover:underline">
              All assets
            </Link>
          }
        >
          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-mute">
                  <th className="px-4 py-2.5 font-medium">Asset</th>
                  <th className="px-3 py-2.5 font-medium">Status</th>
                  <th className="px-3 py-2.5 font-medium">Health %</th>
                  <th className="px-3 py-2.5 font-medium text-right whitespace-nowrap">RUL (d)</th>
                  <th className="px-3 py-2.5 font-medium text-right">Temp</th>
                  <th className="px-3 py-2.5 font-medium text-right">Vibration</th>
                  <th className="px-3 py-2.5 font-medium hidden md:table-cell">Trend</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((m) => (
                  <tr key={m.id} className="border-t border-line hover:bg-panel-2">
                    <td className="px-4 py-2.5">
                      <Link to={`/machine/${m.id}`} className="block">
                        <div className="text-ink hover:text-accent whitespace-nowrap">{m.name}</div>
                        <div className="num text-[11px] text-dim">
                          {m.id} · {m.line}
                        </div>
                      </Link>
                    </td>
                    <td className="px-3 py-2.5">
                      <StatusBadge status={m.status} condition={m.condition} />
                    </td>
                    <td className="px-3 py-2.5">
                      <HealthBar value={m.health} status={m.status} />
                    </td>
                    <td className="num px-3 py-2.5 text-right text-xs" style={{ color: m.status === "ok" ? undefined : STATUS_COLOR[m.status] }}>
                      {m.rul.toFixed(1)}
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <SensorCell k="temperature" v={m.sensor.temperature} />
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <SensorCell k="vibration" v={m.sensor.vibration} />
                    </td>
                    <td className="px-3 py-2.5 hidden md:table-cell">
                      <Sparkline data={m.series.health.slice(-30)} color={STATUS_COLOR[m.status]} width={90} height={22} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ul className="divide-y divide-line lg:hidden">
            {sorted.map((m) => (
              <li key={m.id}>
                <Link to={`/machine/${m.id}`} className="block px-4 py-3 active:bg-panel-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-ink">{m.name}</div>
                      <div className="num text-[11px] text-dim">
                        {m.id} · {m.line}
                      </div>
                    </div>
                    <StatusBadge status={m.status} condition={m.condition} />
                  </div>
                  <div className="mt-2">
                    <HealthBar value={m.health} status={m.status} />
                  </div>
                  <div className="mt-2 grid grid-cols-3 gap-2 text-[11px] text-dim">
                    <div>
                      RUL
                      <div className="num text-xs" style={{ color: m.status === "ok" ? undefined : STATUS_COLOR[m.status] }}>
                        {m.rul.toFixed(1)} d
                      </div>
                    </div>
                    <div>
                      Temp
                      <div><SensorCell k="temperature" v={m.sensor.temperature} /></div>
                    </div>
                    <div>
                      Vibration
                      <div><SensorCell k="vibration" v={m.sensor.vibration} /></div>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel
          title="Recent alarms"
          pad={false}
          action={
            <Link to="/alerts" className="text-xs text-accent hover:underline">
              View all
            </Link>
          }
        >
          <ul className="max-h-[560px] overflow-y-auto divide-y divide-line">
            {t.alarms.slice(0, 14).map((a) => {
              const def = SENSOR_BY_KEY[a.sensor];
              return (
                <li key={a.id}>
                  <Link to={`/machine/${a.machineId}`} className="flex gap-3 px-4 py-2.5 hover:bg-panel-2">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ background: STATUS_COLOR[a.severity] }} />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm text-ink truncate">
                        {def.label} {a.severity === "crit" ? "critical" : "warning"} · {a.machineId}
                      </div>
                      <div className="text-xs text-dim truncate">
                        {a.machine} — <span className="num">{a.value} {def.unit}</span>
                      </div>
                    </div>
                    <span className="num text-[11px] text-dim shrink-0">{fmtTime(a.ts)}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
          <Link to="/alerts" className="flex items-center justify-center gap-1 border-t border-line py-2.5 text-xs text-mute hover:text-ink">
            Alarm console <FiArrowRight size={12} />
          </Link>
        </Panel>
      </div>
    </>
  );
}
