export function eventText(e) {
  if (e.kind === "failure") return "Failure recorded";
  return e.kind === "crit" ? `Critical: ${e.p.toFixed(1)}% failure risk` : `Warning: ${e.p.toFixed(1)}% failure risk`;
}
export const fmtRul = (v) => (v >= 29.95 ? "30+" : v.toFixed(1));
