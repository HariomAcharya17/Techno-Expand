import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Line } from "react-chartjs-2";
import { FiArrowLeft, FiDownload, FiAlertTriangle } from "react-icons/fi";
import { useReplay, machineAt, fmtDay, fmtDayShort, dayToDate } from "../sim/replay";
import { Panel, Kpi, StatusBadge, Sparkline, ReplayLoading } from "../components/ui";
import { STATUS_COLOR, STATUS_TEXT } from "../lib/status";
import { lineOptions } from "../lib/chart";
import { eventText, fmtRul } from "../lib/events";

const fmtNum = (v) => (Math.abs(v) >= 1e6 ? `${(v / 1e6).toFixed(2)}M` : Math.abs(v) >= 1e4 ? `${(v / 1e3).toFixed(1)}k` : String(v));

export default function MachineDetails() {
  const { id } = useParams();
  const r = useReplay();
  const [exporting, setExporting] = useState(false);
  if (r.status !== "ready") return <ReplayLoading r={r} />;
  const { data, day } = r;
  const m = data.byId[id];

  if (!m) {
    return (
      <div className="py-20 text-center">
        <p className="text-mute">Machine “{id}” not found.</p>
        <Link to="/machines" className="mt-3 inline-block text-sm text-accent hover:underline">Back to machines</Link>
      </div>
    );
  }

  const s = machineAt(m, day);
  const upTo = s.k + 1; // rows available up to the replay day
  const labels = m.day.slice(0, upTo).map(fmtDayShort);
  const risk = m.p.slice(0, upTo).map((p) => p / 10);
  const events = m.events.filter((e) => e.day <= day).reverse();
  const tw = data.thresholdWarning * 100;
  const tc = data.thresholdCritical * 100;

  const exportToExcel = async () => {
    setExporting(true);
    try {
      const XLSX = await import("xlsx");
      const rows = m.day.slice(0, upTo).map((d, k) => ({
        date: dayToDate(d).toISOString().slice(0, 10),
        ...Object.fromEntries(data.metrics.map((name) => [name, m.metrics[name][k]])),
        failure_risk_pct: m.p[k] / 10,
        condition: STATUS_TEXT[m.cond[k]],
        predicted_rul_days: m.rul[k] / 10,
        actual_days_to_failure: m.rulTrue[k] ?? "",
        failure_recorded: m.failureDay === d ? 1 : 0,
      }));
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), "Daily");
      XLSX.utils.book_append_sheet(
        wb,
        XLSX.utils.aoa_to_sheet([
          ["Device", m.device],
          ["Source", data.source],
          ["Model", `v2, failure within ${data.horizonDays} days + RUL (capped at ${data.rulCapDays} days)`],
          ["Warning threshold (%)", tw],
          ["Critical threshold (%)", tc],
        ]),
        "About"
      );
      XLSX.writeFile(wb, `${m.device}_model_v2.xlsx`);
    } finally {
      setExporting(false);
    }
  };

  return (
    <>
      <Link to="/machines" className="mb-4 inline-flex items-center gap-1.5 text-sm text-mute hover:text-ink">
        <FiArrowLeft size={14} /> Machines
      </Link>

      <div className="flex flex-col gap-4 rounded border border-line bg-panel p-4 md:flex-row md:items-center">
        <div className="h-24 w-full shrink-0 overflow-hidden rounded bg-panel-2 md:w-40">
          <img src={m.image} alt="" className="h-full w-full object-cover" onError={(e) => (e.currentTarget.style.display = "none")} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-xl font-semibold sm:text-2xl">{m.name}</h1>
            <StatusBadge status={s.status} />
          </div>
          <dl className="num mt-2 grid grid-cols-2 gap-x-6 gap-y-1 text-xs sm:grid-cols-4">
            {[
              ["Device ID", m.device],
              ["Slot", m.slot],
              ["Readings so far", s.k >= 0 ? `${s.k + 1} days` : "none"],
              ["Outcome in data", m.failed ? `Failed ${fmtDay(m.failureDay)}` : "No failure recorded"],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="text-dim">{k}</dt>
                <dd className="truncate text-mute">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
        <button
          onClick={exportToExcel}
          disabled={exporting || s.k < 0}
          className="inline-flex items-center justify-center gap-2 rounded border border-line bg-panel-2 px-3 py-2 text-sm text-ink hover:border-accent/50 disabled:opacity-50"
        >
          <FiDownload size={14} /> {exporting ? "Exporting…" : "Export .xlsx"}
        </button>
      </div>

      {s.status === "offline" ? (
        <p className="mt-6 text-sm text-mute">This machine has no readings on or before {fmtDay(day)}.</p>
      ) : (
        <>
          {(s.status === "crit" || s.status === "failed") && (
            <div className="mt-4 flex gap-3 rounded border border-crit/40 bg-crit/10 p-4 text-sm">
              <FiAlertTriangle className="mt-0.5 shrink-0 text-crit" size={18} />
              <div>
                <p className="font-medium text-crit">
                  {s.status === "failed" ? `Failure recorded on ${fmtDay(s.failedOn)}.` : `Model v2: ${s.prob.toFixed(1)}% risk of failure within ${data.horizonDays} days.`}
                </p>
                <p className="mt-1 text-mute">
                  Before dispatching maintenance, rule out human error: check power supply, main switch status, cable wiring and loose connectors.
                </p>
              </div>
            </div>
          )}

          <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
            <Kpi label="Health" value={s.health.toFixed(1)} unit="%" tone={s.status} sub="100 − failure risk" />
            <Kpi label={`Failure risk (${data.horizonDays} days)`} value={s.prob.toFixed(1)} unit="%" tone={s.status === "ok" ? undefined : s.status} sub={`Warning ≥ ${tw.toFixed(0)}% · Critical ≥ ${tc.toFixed(0)}%`} />
            <Kpi label="Predicted RUL" value={fmtRul(s.rul)} unit="days" sub={`Model v2, capped at ${data.rulCapDays}`} />
            <Kpi
              label="Actual days to failure"
              value={s.rulTrue != null ? s.rulTrue : "—"}
              unit={s.rulTrue != null ? "days" : undefined}
              sub={s.rulTrue != null ? "From the dataset, for comparison" : m.failed ? `More than ${data.rulCapDays} days away` : "No failure in the data"}
            />
            <div className="col-span-2 md:col-span-1">
              <Kpi label="Reading date" value={fmtDay(s.lastDay)} sub={s.reporting ? "Reading for this day" : "No reading today, last one shown"} />
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
            <Panel title="Failure risk over time" className="xl:col-span-2">
              <div className="h-64">
                <Line
                  data={{
                    labels,
                    datasets: [
                      { label: "Failure risk", data: risk, borderColor: STATUS_COLOR[s.status], backgroundColor: STATUS_COLOR[s.status] + "18", fill: true, borderWidth: 1.75, tension: 0.15 },
                      { label: "Critical threshold", data: labels.map(() => tc), borderColor: "#cc3333", borderDash: [4, 4], borderWidth: 1, pointRadius: 0 },
                      { label: "Warning threshold", data: labels.map(() => tw), borderColor: "#c47a00", borderDash: [4, 4], borderWidth: 1, pointRadius: 0 },
                    ],
                  }}
                  options={lineOptions({ min: 0, max: 100, unit: "%" })}
                />
              </div>
            </Panel>
            <Panel title="Alert history" pad={false}>
              {events.length === 0 ? (
                <p className="px-4 py-6 text-sm text-mute">No alerts for this machine up to {fmtDay(day)}.</p>
              ) : (
                <ul className="max-h-72 divide-y divide-line overflow-y-auto">
                  {events.map((e) => (
                    <li key={e.id} className="flex items-center gap-3 px-4 py-2.5 text-sm">
                      <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: STATUS_COLOR[e.kind === "failure" ? "failed" : e.severity] }} />
                      <span className="flex-1 text-ink">{eventText(e)}</span>
                      <span className="num text-[11px] text-dim">{fmtDayShort(e.day)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
          </div>

          {m.failed && (
            <Panel title="Remaining useful life: predicted vs actual" className="mt-4">
              <div className="h-56">
                <Line
                  data={{
                    labels,
                    datasets: [
                      { label: "Predicted RUL", data: m.rul.slice(0, upTo).map((v) => v / 10), borderColor: "#0b5cad", borderWidth: 1.75, tension: 0.15 },
                      { label: "Actual days to failure", data: m.rulTrue.slice(0, upTo), borderColor: "#1d2833", borderDash: [5, 4], borderWidth: 1.25, spanGaps: false },
                    ],
                  }}
                  options={{ ...lineOptions({ min: 0, max: data.rulCapDays, unit: " d" }), plugins: { ...lineOptions().plugins, legend: { display: true, position: "bottom", labels: { boxWidth: 14, boxHeight: 2 } } } }}
                />
              </div>
              <p className="mt-2 text-xs text-dim">Actual values come from the recorded failure date and are shown only for the last {data.rulCapDays} days before it.</p>
            </Panel>
          )}

          <h2 className="mb-1 mt-6 text-sm font-semibold">Sensor channels</h2>
          <p className="mb-3 text-xs text-dim">Dataset metrics are anonymised counters, so they have no physical units. metric8 is a copy of metric7 and is not used.</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {data.metrics.map((name) => {
              const series = m.metrics[name].slice(Math.max(0, s.k - 29), s.k + 1);
              const v = m.metrics[name][s.k];
              const last7 = m.metrics[name].slice(Math.max(0, s.k - 7), s.k);
              const mean7 = last7.length ? last7.reduce((a, b) => a + b, 0) / last7.length : v;
              const change = v - mean7;
              return (
                <div key={name} className="rounded border border-line bg-panel p-4">
                  <div className="num text-xs text-mute">{name}</div>
                  <div className="mt-2 flex items-end justify-between gap-3">
                    <span className="num text-xl font-medium" title={String(v)}>{fmtNum(v)}</span>
                    <Sparkline data={series} color="#0b5cad" width={110} height={30} />
                  </div>
                  <div className="num mt-1.5 text-[11px] text-dim">
                    vs 7-day avg: <span className={change === 0 ? "" : "text-ink"}>{change > 0 ? "+" : ""}{fmtNum(Math.round(change))}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </>
  );
}
