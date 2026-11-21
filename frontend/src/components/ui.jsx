import { STATUS_COLOR, STATUS_TEXT } from "../lib/status";

export function Panel({ title, action, className = "", children, pad = true }) {
  return (
    <section className={`bg-panel border border-line rounded ${className}`}>
      {title && (
        <header className="flex items-center justify-between gap-3 px-4 h-10 border-b border-line">
          <h2 className="text-sm font-semibold text-ink">{title}</h2>
          {action}
        </header>
      )}
      <div className={pad ? "p-4" : ""}>{children}</div>
    </section>
  );
}

export function StatusBadge({ status }) {
  const label = STATUS_TEXT[status];
  const color = STATUS_COLOR[status];
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium whitespace-nowrap" style={{ color }}>
      <span className="h-2 w-2 rounded-[1px]" style={{ background: color }} />
      {label}
    </span>
  );
}

export function HealthBar({ value, status }) {
  return (
    <div className="flex items-center gap-2 min-w-[110px]">
      <div className="h-1.5 flex-1 bg-[#e6eaee] overflow-hidden">
        <div className="h-full" style={{ width: `${Math.max(2, value)}%`, background: STATUS_COLOR[status] }} />
      </div>
      <span className="num text-xs text-ink w-9 text-right">{value.toFixed(1)}</span>
    </div>
  );
}

export function Sparkline({ data, color = "#0b5cad", width = 96, height = 26 }) {
  if (!data?.length) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const step = width / (data.length - 1 || 1);
  const d = data
    .map((v, i) => `${i ? "L" : "M"}${(i * step).toFixed(1)},${(height - 2 - ((v - min) / span) * (height - 4)).toFixed(1)}`)
    .join("");
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="block overflow-visible">
      <path d={d} fill="none" stroke={color} strokeWidth="1.25" strokeLinejoin="round" />
    </svg>
  );
}

export function Kpi({ label, value, unit, sub, tone }) {
  return (
    <div className="bg-panel border border-line rounded px-4 py-3">
      <div className="text-xs text-mute">{label}</div>
      <div className="mt-1 flex items-baseline gap-1">
        <span className="num text-[22px] font-medium" style={{ color: tone ? STATUS_COLOR[tone] : undefined }}>
          {value}
        </span>
        {unit && <span className="text-xs text-mute">{unit}</span>}
      </div>
      {sub && <div className="mt-0.5 text-xs text-dim truncate">{sub}</div>}
    </div>
  );
}

export function PageHeader({ title, subtitle, right }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-4">
      <div>
        <h1 className="text-lg font-semibold text-ink">{title}</h1>
        {subtitle && <p className="text-[13px] text-mute mt-0.5">{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}

export function ReplayLoading({ r }) {
  return (
    <p className="py-16 text-center text-sm text-mute">
      {r.status === "error" ? `Could not load data: ${r.error}` : "Loading data…"}
    </p>
  );
}
