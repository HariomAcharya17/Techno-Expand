import { Link } from "react-router-dom";
import { Line, Doughnut } from "react-chartjs-2";
import { FiInfo } from "react-icons/fi";
import { useReplay, machineAt, fmtDay, fmtDayShort } from "../sim/replay";
import { Panel, Kpi, StatusBadge, HealthBar, Sparkline, PageHeader, ReplayLoading } from "../components/ui";
import { STATUS_COLOR, STATUS_TEXT } from "../lib/status";
import { lineOptions } from "../lib/chart";
import { eventText, fmtRul } from "../lib/events";

const WINDOW = 60; // days shown in the fleet trend
const STATUSES = ["ok", "warn", "crit", "failed", "offline"];
const SORT_RANK = { failed: 0, crit: 1, warn: 2, ok: 3, offline: 4 };

export default function Dashboard() {
  const r = useReplay();
  if (r.status !== "ready") return <ReplayLoading r={r} />;
  const { data, day } = r;

  const rows = data.machines.map((m) => ({ m, s: machineAt(m, day) }));
  const counts = { ok: 0, warn: 0, crit: 0, failed: 0, offline: 0 };
  rows.forEach(({ s }) => counts[s.status]++);
  const reporting = rows.filter(({ s }) => s.reporting).length;
  const live = rows.filter(({ s }) => s.status !== "offline" && s.status !== "failed"); // failed machines are down
  const avg = live.length ? live.reduce((a, { s }) => a + s.health, 0) / live.length : 0;
  const atRisk = [...live].sort((a, b) => a.s.rul - b.s.rul)[0];
  const sorted = [...rows].sort((a, b) => SORT_RANK[a.s.status] - SORT_RANK[b.s.status] || (a.s.health ?? 0) - (b.s.health ?? 0));

  const from = Math.max(0, day - WINDOW + 1);
  const trendDays = Array.from({ length: day - from + 1 }, (_, i) => from + i);
  const recent = data.events.filter((e) => e.day <= day).slice(0, 12);
  const tw = (data.thresholdWarning * 100).toFixed(0);
  const tc = (data.thresholdCritical * 100).toFixed(0);

  return (
    <>
      <PageHeader
        title="Plant overview"
        subtitle={`${data.machines.length} machines · ${fmtDay(day)} · model v2 predicts failure within ${data.horizonDays} days and remaining useful life`}
        right={
          <Link to="/case-study" className="inline-flex items-center gap-2 rounded border border-line bg-panel px-3 py-2 text-xs text-mute hover:text-ink">
            <FiInfo size={14} /> How the model was built and tested
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <Kpi label="Fleet health" value={avg.toFixed(1)} unit="%" sub="Running machines, 100 − avg risk" tone={avg > 90 ? "ok" : avg > 70 ? "warn" : "crit"} />
        <Kpi label="Reporting today" value={`${reporting}/${data.machines.length}`} sub="Had a reading this day" />
        <Kpi label="Healthy" value={counts.ok} tone="ok" sub={`Risk below ${tw}%`} />
        <Kpi label="Warning" value={counts.warn} tone="warn" sub={`Risk ${tw}–${tc}%`} />
        <Kpi label="Critical / failed" value={counts.crit + counts.failed} tone="crit" sub={`${counts.failed} failure${counts.failed === 1 ? "" : "s"} recorded`} />
        <Kpi
          label="Lowest predicted RUL"
          value={atRisk ? fmtRul(atRisk.s.rul) : "—"}
          unit="days"
          sub={atRisk ? `${atRisk.m.slot} · ${atRisk.m.device}` : ""}
          tone={atRisk && atRisk.s.rul < 10 ? "crit" : undefined}
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Panel title="Fleet health trend" className="xl:col-span-2" action={<span className="text-xs text-dim">last {trendDays.length} days</span>}>
          <div className="h-64">
            <Line
              data={{
                labels: trendDays.map(fmtDayShort),
                datasets: [
                  {
                    label: "Average health",
                    data: trendDays.map((d) => (data.fleet[d] == null ? null : Number(data.fleet[d].toFixed(1)))),
                    borderColor: "#0b5cad",
                    backgroundColor: "rgba(11,92,173,0.06)",
                    fill: true,
                    borderWidth: 2,
                    tension: 0.25,
                    spanGaps: true,
                  },
                ],
              }}
              options={lineOptions({ unit: "%" })}
            />
          </div>
        </Panel>

        <Panel title="Machine status">
          <div className="flex items-center gap-6">
            <div className="relative h-40 w-40 shrink-0">
              <Doughnut
                data={{
                  labels: STATUSES.map((k) => STATUS_TEXT[k]),
                  datasets: [{ data: STATUSES.map((k) => counts[k]), backgroundColor: STATUSES.map((k) => STATUS_COLOR[k]), borderColor: "#ffffff", borderWidth: 3 }],
                }}
                options={{ cutout: "72%", plugins: { legend: { display: false } }, maintainAspectRatio: false }}
              />
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="num text-2xl font-semibold">{data.machines.length}</span>
                <span className="text-[11px] text-mute">machines</span>
              </div>
            </div>
            <ul className="flex-1 space-y-2.5 text-sm">
              {STATUSES.map((k) => (
                <li key={k} className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-sm" style={{ background: STATUS_COLOR[k] }} />
                  <span className="flex-1 text-mute">{STATUS_TEXT[k]}</span>
                  <span className="num">{counts[k]}</span>
                </li>
              ))}
            </ul>
          </div>
        </Panel>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Panel title="Machine condition" className="xl:col-span-2" pad={false} action={<Link to="/machines" className="text-xs text-accent hover:underline">All machines</Link>}>
          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-mute">
                  <th className="px-4 py-2.5 font-medium">Machine</th>
                  <th className="px-3 py-2.5 font-medium">Status</th>
                  <th className="px-3 py-2.5 font-medium">Health %</th>
                  <th className="px-3 py-2.5 text-right font-medium whitespace-nowrap">Failure risk</th>
                  <th className="px-3 py-2.5 text-right font-medium whitespace-nowrap">RUL (d)</th>
                  <th className="px-3 py-2.5 font-medium">Health, 30 days</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map(({ m, s }) => (
                  <tr key={m.id} className="border-t border-line hover:bg-panel-2">
                    <td className="px-4 py-2.5">
                      <Link to={`/machine/${m.id}`} className="block">
                        <div className="whitespace-nowrap text-ink hover:text-accent">{m.name}</div>
                        <div className="num text-[11px] text-dim">{m.slot} · {m.device}</div>
                      </Link>
                    </td>
                    <td className="px-3 py-2.5"><StatusBadge status={s.status} /></td>
                    <td className="px-3 py-2.5">{s.status === "offline" || s.status === "failed" ? <span className="text-xs text-dim">—</span> : <HealthBar value={s.health} status={s.status} />}</td>
                    <td className="num px-3 py-2.5 text-right text-xs">{s.status === "offline" || s.status === "failed" ? "—" : `${s.prob.toFixed(1)}%`}</td>
                    <td className="num px-3 py-2.5 text-right text-xs">{s.status === "offline" || s.status === "failed" ? "—" : fmtRul(s.rul)}</td>
                    <td className="px-3 py-2.5">
                      {s.k >= 0 && <Sparkline data={m.p.slice(Math.max(0, s.k - 29), s.k + 1).map((p) => 100 - p / 10)} color={STATUS_COLOR[s.status]} width={90} height={22} />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ul className="divide-y divide-line lg:hidden">
            {sorted.map(({ m, s }) => (
              <li key={m.id}>
                <Link to={`/machine/${m.id}`} className="block px-4 py-3 active:bg-panel-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-ink">{m.name}</div>
                      <div className="num text-[11px] text-dim">{m.slot} · {m.device}</div>
                    </div>
                    <StatusBadge status={s.status} />
                  </div>
                  {s.status !== "offline" && s.status !== "failed" && (
                    <>
                      <div className="mt-2"><HealthBar value={s.health} status={s.status} /></div>
                      <div className="num mt-1.5 flex gap-4 text-[11px] text-dim">
                        <span>Risk <span className="text-ink">{s.prob.toFixed(1)}%</span></span>
                        <span>RUL <span className="text-ink">{fmtRul(s.rul)} d</span></span>
                      </div>
                    </>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Recent alerts" pad={false} action={<Link to="/alerts" className="text-xs text-accent hover:underline">View all</Link>}>
          {recent.length === 0 ? (
            <p className="px-4 py-6 text-sm text-mute">No alerts yet.</p>
          ) : (
            <ul className="max-h-[560px] divide-y divide-line overflow-y-auto">
              {recent.map((e) => (
                <li key={e.id}>
                  <Link to={`/machine/${e.device}`} className="flex gap-3 px-4 py-2.5 hover:bg-panel-2">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ background: STATUS_COLOR[e.kind === "failure" ? "failed" : e.severity] }} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm text-ink">{eventText(e)}</div>
                      <div className="num truncate text-xs text-dim">{e.slot} · {e.device}</div>
                    </div>
                    <span className="num shrink-0 text-[11px] text-dim">{fmtDayShort(e.day)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </>
  );
}
