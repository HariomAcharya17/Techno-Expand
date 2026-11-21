// Browser-side IoT telemetry simulator.
// Mimics what the ESP32 sensor nodes -> cloud gateway -> WebSocket stream produced in the
// original FastAPI backend (backend/main.py), so the dashboard works as a static site.
import { useSyncExternalStore } from "react";
import {
  MACHINES,
  SENSORS,
  SENSOR_BY_KEY,
  sensorState,
  ENGINEERS,
  EVENT_TYPES,
  NOTES,
  TICK_MS,
  HISTORY_LEN,
} from "./config";

// ---------- helpers ----------
function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const seeded = mulberry32(47);
const sRand = (lo, hi) => lo + seeded() * (hi - lo);
const sInt = (lo, hi) => Math.floor(sRand(lo, hi + 1));
const sPick = (arr) => arr[Math.floor(seeded() * arr.length)];
const gauss = () => {
  let u = 0;
  let v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
};
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const round = (v, d = 2) => Math.round(v * 10 ** d) / 10 ** d;
const iso = (d) => d.toISOString().slice(0, 10);
const addDays = (d, n) => new Date(d.getTime() + n * 86400000);

const NOISE = { Healthy: 0.04, Medium: 0.07, Fail: 0.11 };
const HEALTH_BASE = { Healthy: [92, 98], Medium: [58, 72], Fail: [8, 28] };

// ---------- initial state ----------
function makeHistory(condition) {
  const out = [];
  let d = addDays(new Date(), -sInt(10, 40));
  const n = sInt(4, 7);
  for (let i = 0; i < n; i++) {
    out.push({
      date: iso(d),
      event: sPick(EVENT_TYPES),
      engineer: sPick(ENGINEERS),
      notes: sPick(NOTES[condition]),
    });
    d = addDays(d, -sInt(40, 120));
  }
  return out;
}

function initialRul(c) {
  if (c === "Healthy") return sInt(300, 900);
  if (c === "Medium") return sInt(50, 150);
  return sInt(1, 20);
}
function initialHours(c) {
  if (c === "Healthy") return sInt(2000, 8000);
  if (c === "Medium") return sInt(8000, 15000);
  return sInt(15000, 45000);
}

const internal = {}; // per-machine targets (not exposed)

function stepSensor(m, key, v) {
  const def = SENSOR_BY_KEY[key];
  const [lo, hi] = def.ranges[m.condition];
  const span = hi - lo;
  const t = internal[m.id].targets;
  if (Math.random() < 0.03) t[key] = lo + Math.random() * span; // occasional operating-point change
  const next = v + (t[key] - v) * 0.18 + gauss() * span * NOISE[m.condition];
  return round(clamp(next, lo - span * 0.25, hi + span * 0.25));
}

function stepHealth(m, h) {
  const [lo, hi] = HEALTH_BASE[m.condition];
  const mid = (lo + hi) / 2;
  return round(clamp(h + (mid - h) * 0.15 + gauss() * (hi - lo) * 0.08, lo - 4, hi + 2), 1);
}

function buildInitial() {
  const now = Date.now();
  const machines = {};
  for (const m of MACHINES) {
    const targets = {};
    const sensor = {};
    for (const s of SENSORS) {
      const [lo, hi] = s.ranges[m.condition];
      targets[s.key] = sRand(lo, hi);
      sensor[s.key] = round(targets[s.key]);
    }
    internal[m.id] = { targets };
    const [hlo, hhi] = HEALTH_BASE[m.condition];
    const history = makeHistory(m.condition);
    machines[m.id] = {
      ...m,
      health: round(sRand(hlo, hhi), 1),
      sensor,
      rul: initialRul(m.condition),
      workingHours: initialHours(m.condition),
      maintenanceHistory: history,
      lastChecked: history[0].date,
      series: { health: [], ...Object.fromEntries(SENSORS.map((s) => [s.key, []])) },
    };
  }

  // Backfill HISTORY_LEN points so charts are populated on first paint.
  const times = [];
  const fleet = [];
  for (let i = HISTORY_LEN - 1; i >= 0; i--) {
    times.push(now - i * TICK_MS);
    let sum = 0;
    for (const m of MACHINES) {
      const s = machines[m.id];
      s.health = stepHealth(m, s.health);
      s.series.health.push(s.health);
      for (const def of SENSORS) {
        s.sensor[def.key] = stepSensor(m, def.key, s.sensor[def.key]);
        s.series[def.key].push(s.sensor[def.key]);
      }
      sum += s.health;
    }
    fleet.push(round(sum / MACHINES.length, 1));
  }
  for (const m of MACHINES) derive(machines[m.id]);

  // Seed alarm log with currently active conditions.
  const alarms = [];
  const active = {};
  let aid = 0;
  for (const m of MACHINES) {
    for (const def of SENSORS) {
      const st = sensorState(def, machines[m.id].sensor[def.key]);
      active[`${m.id}:${def.key}`] = st;
      if (st !== "ok") {
        alarms.push({
          id: ++aid,
          ts: now - Math.floor(Math.random() * 15 * 60000),
          machineId: m.id,
          machine: m.name,
          sensor: def.key,
          value: machines[m.id].sensor[def.key],
          severity: st,
          acked: false,
        });
      }
    }
  }
  alarms.sort((a, b) => b.ts - a.ts);

  return {
    tick: 0,
    ts: now,
    startedAt: now,
    times,
    fleet,
    machines,
    alarms,
    active,
    nextAlarmId: aid + 1,
    gateway: { packets: MACHINES.length * SENSORS.length * HISTORY_LEN, latency: 48, dropped: 0 },
  };
}

function derive(s) {
  s.failure = round(100 - s.health, 1);
  s.rul = Math.max(1, s.rul); // keep full precision so the 0.02 d/tick decay accumulates
  // Next service: before predicted end of life, capped at a 90-day preventive interval.
  // Critical assets are due now.
  s.nextService =
    s.condition === "Fail" ? iso(new Date()) : iso(addDays(new Date(), Math.min(90, Math.floor(s.rul * 0.7))));
  s.status =
    s.condition === "Fail" ? "crit" : s.condition === "Medium" ? "warn" : "ok";
}

// ---------- tick ----------
let state = buildInitial();
const listeners = new Set();
let timer = null;

function tick() {
  const prev = state;
  const now = Date.now();
  const machines = {};
  let sum = 0;
  const active = { ...prev.active };
  const newAlarms = [];
  let nextAlarmId = prev.nextAlarmId;

  for (const m of MACHINES) {
    const p = prev.machines[m.id];
    const s = {
      ...p,
      sensor: { ...p.sensor },
      series: {},
      health: stepHealth(m, p.health),
      rul: p.rul - 0.02,
      workingHours: round(p.workingHours + TICK_MS / 3600000, 3),
    };
    for (const def of SENSORS) {
      s.sensor[def.key] = stepSensor(m, def.key, p.sensor[def.key]);
      s.series[def.key] = [...p.series[def.key].slice(1 - HISTORY_LEN), s.sensor[def.key]];
      const key = `${m.id}:${def.key}`;
      const st = sensorState(def, s.sensor[def.key]);
      const was = active[key];
      const rank = { ok: 0, warn: 1, crit: 2 };
      if (rank[st] > rank[was]) {
        newAlarms.push({
          id: nextAlarmId++,
          ts: now,
          machineId: m.id,
          machine: m.name,
          sensor: def.key,
          value: s.sensor[def.key],
          severity: st,
          acked: false,
        });
      }
      active[key] = st;
    }
    s.series.health = [...p.series.health.slice(1 - HISTORY_LEN), s.health];
    derive(s);
    machines[m.id] = s;
    sum += s.health;
  }

  state = {
    ...prev,
    tick: prev.tick + 1,
    ts: now,
    times: [...prev.times.slice(1 - HISTORY_LEN), now],
    fleet: [...prev.fleet.slice(1 - HISTORY_LEN), round(sum / MACHINES.length, 1)],
    machines,
    active,
    alarms: [...newAlarms.reverse(), ...prev.alarms].slice(0, 200),
    nextAlarmId,
    gateway: {
      packets: prev.gateway.packets + MACHINES.length * SENSORS.length,
      latency: Math.round(clamp(prev.gateway.latency + gauss() * 6, 32, 95)),
      dropped: prev.gateway.dropped + (Math.random() < 0.04 ? 1 : 0),
    },
  };
  listeners.forEach((l) => l());
}

function subscribe(l) {
  listeners.add(l);
  if (!timer) timer = setInterval(tick, TICK_MS);
  return () => {
    listeners.delete(l);
    if (listeners.size === 0) {
      clearInterval(timer);
      timer = null;
    }
  };
}

export function acknowledge(ids) {
  const set = new Set(ids);
  state = { ...state, alarms: state.alarms.map((a) => (set.has(a.id) ? { ...a, acked: true } : a)) };
  listeners.forEach((l) => l());
}

export function useTelemetry() {
  return useSyncExternalStore(subscribe, () => state);
}
