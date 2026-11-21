// Replay of real data: daily readings of 15 machines from the Kaggle dataset that model v2 never saw
// in training, together with the model's precomputed predictions (public/replay.json,
// built by ml/build_replay.py). The browser only plays the timeline back; it does not run the model.
import { useSyncExternalStore } from "react";

export const DAY_MS = 86400000;
const START = Date.UTC(2015, 0, 1);
export const dayToDate = (d) => new Date(START + d * DAY_MS);
export const fmtDay = (d) =>
  dayToDate(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" });
export const fmtDayShort = (d) => dayToDate(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", timeZone: "UTC" });

// Illustrative asset names and photos. Device IDs, readings and predictions are real.
const ASSET_NAMES = [
  "CNC Milling Machine", "Air Compressor", "Centrifugal Pump", "Injection Molding Machine", "Industrial Boiler",
  "Conveyor System", "Hydraulic Press", "Cooling Tower", "Industrial Robot Arm", "Steam Turbine",
  "Electric Motor", "Heat Exchanger", "Reciprocating Pump", "Industrial Chiller", "Rotary Kiln",
];
// Display order mixes failing and non-failing machines so the list is not sorted by outcome.
const DISPLAY_ORDER = [0, 6, 7, 1, 8, 9, 2, 10, 3, 11, 12, 4, 13, 5, 14];

const RANK = { ok: 0, warn: 1, crit: 2, failed: 3 };
const START_DAY = 30; // start with a month of history on screen

let D = null; // prepared data
let S = { status: "loading", day: START_DAY, playing: true, speed: 1, acked: new Set() };
const listeners = new Set();
let timer = null;
const emit = () => listeners.forEach((l) => l());

function prepare(raw) {
  const tw = raw.thresholdWarning * 1000;
  const tc = raw.thresholdCritical * 1000;
  const machines = DISPLAY_ORDER.map((src, i) => {
    const m = raw.machines[src];
    const n = m.day.length;
    const idxAt = new Int16Array(raw.endDay + 1).fill(-1);
    for (let k = 0, d = 0; d <= raw.endDay; d++) {
      while (k + 1 < n && m.day[k + 1] <= d) k++;
      idxAt[d] = m.day[0] <= d ? k : -1;
    }
    const cond = m.p.map((p) => (p >= tc ? "crit" : p >= tw ? "warn" : "ok"));
    const events = [];
    let prev = "ok";
    for (let k = 0; k < n; k++) {
      if (m.failureDay === m.day[k]) {
        events.push({ id: `${m.device}-f`, device: m.device, day: m.day[k], kind: "failure", severity: "crit", p: m.p[k] / 10 });
      } else if (RANK[cond[k]] > RANK[prev]) {
        events.push({ id: `${m.device}-${k}`, device: m.device, day: m.day[k], kind: cond[k], severity: cond[k], p: m.p[k] / 10 });
      }
      prev = cond[k];
    }
    return {
      ...m,
      id: m.device,
      slot: `M${i + 1}`,
      name: ASSET_NAMES[i],
      image: `/machines/M${i + 1}.jpg`,
      cond,
      idxAt,
      events,
    };
  });
  // Fleet average health per day, over machines with a reading that day
  const fleet = [];
  for (let d = 0; d <= raw.endDay; d++) {
    let sum = 0;
    let c = 0;
    for (const m of machines) {
      const k = m.idxAt[d];
      if (k >= 0 && m.day[k] === d) {
        sum += 100 - m.p[k] / 10;
        c++;
      }
    }
    fleet.push(c ? sum / c : null);
  }
  const events = machines.flatMap((m) => m.events.map((e) => ({ ...e, name: m.name, slot: m.slot })));
  events.sort((a, b) => b.day - a.day || RANK[b.severity] - RANK[a.severity]);
  D = { ...raw, machines, byId: Object.fromEntries(machines.map((m) => [m.id, m])), fleet, events };
}

fetch("/replay.json")
  .then((r) => {
    if (!r.ok) throw new Error(`replay.json: HTTP ${r.status}`);
    return r.json();
  })
  .then((raw) => {
    prepare(raw);
    S = { ...S, status: "ready" };
    restart();
    emit();
  })
  .catch((err) => {
    S = { ...S, status: "error", error: String(err) };
    emit();
  });

function tick() {
  if (!D) return;
  const next = S.day >= D.endDay ? START_DAY : S.day + 1;
  S = { ...S, day: next };
  emit();
}

function restart() {
  clearInterval(timer);
  timer = null;
  if (S.playing && D && listeners.size) timer = setInterval(tick, 2000 / S.speed);
}

function subscribe(l) {
  listeners.add(l);
  if (listeners.size === 1) restart();
  return () => {
    listeners.delete(l);
    if (!listeners.size) restart();
  };
}

export const togglePlay = () => {
  S = { ...S, playing: !S.playing };
  restart();
  emit();
};
export const setSpeed = (speed) => {
  S = { ...S, speed };
  restart();
  emit();
};
export const seek = (day) => {
  if (!D) return;
  S = { ...S, day: Math.max(0, Math.min(D.endDay, Math.round(day))) };
  emit();
};
export const acknowledge = (ids) => {
  const acked = new Set(S.acked);
  ids.forEach((id) => acked.add(id));
  S = { ...S, acked };
  emit();
};

/** Current state of one machine on a given replay day. */
export function machineAt(m, day) {
  const k = m.idxAt[day];
  if (k < 0) return { reporting: false, status: "offline", k };
  const failedNow = m.failureDay != null && day >= m.failureDay && m.day[k] === m.failureDay;
  const p = m.p[k] / 10;
  const status = failedNow ? "failed" : m.cond[k];
  return {
    k,
    reporting: m.day[k] === day,
    lastDay: m.day[k],
    status,
    prob: p,
    health: 100 - p,
    rul: m.rul[k] / 10,
    rulTrue: m.rulTrue[k],
    failedOn: m.failureDay != null && day >= m.failureDay ? m.failureDay : null,
  };
}

export function useReplay() {
  const s = useSyncExternalStore(subscribe, () => S);
  return { ...s, data: D };
}
