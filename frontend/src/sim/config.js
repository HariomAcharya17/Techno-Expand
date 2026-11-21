// Static plant configuration for the simulated IoT fleet.
// Ported from backend/main.py so the demo runs fully in the browser (no server needed on Vercel).

export const MACHINES = [
  { id: "M1", name: "CNC Milling Machine", line: "Line A", area: "Machining Bay", condition: "Healthy" },
  { id: "M2", name: "Air Compressor", line: "Utilities", area: "Compressor Room", condition: "Healthy" },
  { id: "M3", name: "Centrifugal Pump", line: "Line B", area: "Fluid Handling", condition: "Medium" },
  { id: "M4", name: "Injection Molding Machine", line: "Line A", area: "Molding Hall", condition: "Healthy" },
  { id: "M5", name: "Industrial Boiler", line: "Utilities", area: "Boiler House", condition: "Healthy" },
  { id: "M6", name: "Conveyor System", line: "Line C", area: "Packaging", condition: "Fail" },
  { id: "M7", name: "Hydraulic Press", line: "Line A", area: "Press Shop", condition: "Healthy" },
  { id: "M8", name: "Cooling Tower", line: "Utilities", area: "Roof Deck", condition: "Fail" },
  { id: "M9", name: "Industrial Robot Arm", line: "Line C", area: "Assembly Cell 2", condition: "Healthy" },
  { id: "M10", name: "Steam Turbine", line: "Power", area: "Turbine Hall", condition: "Fail" },
  { id: "M11", name: "Electric Motor", line: "Line B", area: "Drive Room", condition: "Healthy" },
  { id: "M12", name: "Heat Exchanger", line: "Line B", area: "Thermal Unit", condition: "Healthy" },
  { id: "M13", name: "Reciprocating Pump", line: "Line B", area: "Fluid Handling", condition: "Healthy" },
  { id: "M14", name: "Industrial Chiller", line: "Utilities", area: "Chiller Plant", condition: "Healthy" },
  { id: "M15", name: "Rotary Kiln", line: "Power", area: "Kiln House", condition: "Fail" },
].map((m, i) => ({
  ...m,
  node: `ESP32-N${String(i + 1).padStart(2, "0")}`,
  gateway: i < 8 ? "GW-01" : "GW-02",
  firmware: "v2.4.1",
}));

// Value ranges per machine condition (same as backend/main.py)
// plus alarm thresholds used for the colour state of each sensor tile.
export const SENSORS = [
  { key: "temperature", label: "Temperature", unit: "°C",  ranges: { Healthy: [35, 45], Medium: [50, 70], Fail: [70, 110] }, warnHi: 50, critHi: 70 },
  { key: "pressure",    label: "Pressure",    unit: "bar", ranges: { Healthy: [1.0, 2.0], Medium: [2.0, 3.8], Fail: [3.8, 6.8] }, warnHi: 2.2, critHi: 3.8 },
  { key: "vibration",   label: "Vibration",   unit: "mm/s",ranges: { Healthy: [2, 6], Medium: [7, 15], Fail: [15, 45] }, warnHi: 7.1, critHi: 15 },
  { key: "humidity",    label: "Humidity",    unit: "%RH", ranges: { Healthy: [40, 60], Medium: [50, 75], Fail: [60, 95] }, warnHi: 65, critHi: 80 },
  { key: "current",     label: "Current",     unit: "A",   ranges: { Healthy: [8, 14], Medium: [14, 22], Fail: [22, 40] }, warnHi: 15, critHi: 22 },
  { key: "voltage",     label: "Voltage",     unit: "V",   ranges: { Healthy: [365, 395], Medium: [340, 420], Fail: [300, 480] }, warnLo: 355, warnHi: 405, critLo: 340, critHi: 420 },
  { key: "rpm",         label: "Speed",       unit: "rpm", ranges: { Healthy: [1100, 1300], Medium: [900, 1600], Fail: [200, 2000] }, warnLo: 1050, warnHi: 1350, critLo: 900, critHi: 1600 },
  { key: "load",        label: "Load",        unit: "%",   ranges: { Healthy: [20, 60], Medium: [40, 90], Fail: [80, 130] }, warnHi: 65, critHi: 90 },
  { key: "noise",       label: "Acoustic",    unit: "dB",  ranges: { Healthy: [40, 60], Medium: [60, 90], Fail: [90, 140] }, warnHi: 65, critHi: 90 },
];

export const SENSOR_BY_KEY = Object.fromEntries(SENSORS.map((s) => [s.key, s]));

export function sensorState(def, v) {
  if ((def.critHi != null && v >= def.critHi) || (def.critLo != null && v <= def.critLo)) return "crit";
  if ((def.warnHi != null && v >= def.warnHi) || (def.warnLo != null && v <= def.warnLo)) return "warn";
  return "ok";
}

// Display label for the ML classes (model classes 0/1/2).
export const CONDITION_LABEL = { Healthy: "Healthy", Medium: "Warning", Fail: "Critical" };

export const ENGINEERS = ["Jacob Keller", "Rina Shah", "Michael Torres", "Sara Menon", "David Park", "Arjun Iyer", "Elena Petrova"];

export const EVENT_TYPES = [
  "Bearing Replacement",
  "Motor Alignment Correction",
  "Thermal Shock Test",
  "Cooling System Overhaul",
  "Valve Calibration",
  "Vibration Diagnostics",
  "Full Preventive Maintenance",
];

export const NOTES = {
  Healthy: ["All readings normal.", "Routine check completed.", "System running at optimal efficiency."],
  Medium: ["Minor anomaly detected.", "Component wear detected, advising monitoring.", "Slight misalignment corrected."],
  Fail: [
    "Critical overheating detected.",
    "High vibration — unsafe for operation.",
    "Severe pressure fluctuation, immediate service required.",
  ],
};

export const TICK_MS = 2000;
export const HISTORY_LEN = 60;
