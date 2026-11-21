import { FiRadio, FiCpu, FiCloud, FiActivity, FiMonitor } from "react-icons/fi";
import { Panel, PageHeader } from "../components/ui";

const PIPELINE = [
  { icon: FiActivity, title: "Sensors", text: "Temperature, pressure, vibration, humidity, current, voltage, speed, load and acoustic level on each machine." },
  { icon: FiCpu, title: "ESP32 edge node", text: "Samples every channel, timestamps readings and checks thresholds locally." },
  { icon: FiRadio, title: "Gateway", text: "Collects data from the nodes over Wi-Fi and forwards it to the cloud." },
  { icon: FiCloud, title: "Cloud + ML", text: "Backend scales the features and runs the Random Forest model to get the condition class, health % and RUL. In the prototype, predict.py runs the model; the live stream used fixed conditions." },
  { icon: FiMonitor, title: "Dashboard", text: "Live WebSocket stream to this operator console: trends, alarms, maintenance planning." },
];

const MISSION = [
  ["Predict, not react", "Detect degradation early, so maintenance is planned before a breakdown stops the line."],
  ["Reduce downtime", "Act on remaining-useful-life estimates instead of fixed service calendars."],
  ["Scale from one machine to a plant", "The same node → gateway → cloud pattern works for 1 or 1,000 assets."],
];

const FUTURE = [
  ["Smart energy management", "Use load and current trends to cut power waste."],
  ["Autonomous maintenance scheduling", "Create work orders automatically when RUL drops below a limit."],
  ["Managed cloud IoT", "Move ingestion to AWS IoT Core, Azure IoT Hub or Google Cloud."],
  ["Plant-wide predictive model", "Train on real plant data across many machine types."],
];

export default function Architecture() {
  return (
    <>
      <PageHeader
        title="IoT Architecture"
        subtitle="How sensors, edge devices, the cloud and the ML model work together."
      />

      <Panel title="Data pipeline">
        <ol className="grid grid-cols-1 gap-3 md:grid-cols-5">
          {PIPELINE.map(({ icon, title, text }, i) => {
            const Icon = icon;
            return (
            <li key={title} className="relative rounded border border-line bg-panel-2 p-4">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded bg-accent/10 text-accent">
                  <Icon size={16} />
                </span>
                <span className="num text-xs text-dim">0{i + 1}</span>
              </div>
              <div className="mt-3 font-medium">{title}</div>
              <p className="mt-1 text-sm text-mute leading-relaxed">{text}</p>
              {i < PIPELINE.length - 1 && (
                <span className="absolute -right-2.5 top-1/2 hidden -translate-y-1/2 text-dim md:block" aria-hidden="true">
                  ›
                </span>
              )}
            </li>
            );
          })}
        </ol>
      </Panel>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Panel title="Mission">
          <ul className="space-y-4">
            {MISSION.map(([h, p]) => (
              <li key={h}>
                <div className="font-medium">{h}</div>
                <p className="mt-0.5 text-sm text-mute">{p}</p>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="Roadmap">
          <ul className="space-y-4">
            {FUTURE.map(([h, p]) => (
              <li key={h} className="flex gap-3">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                <div>
                  <div className="font-medium">{h}</div>
                  <p className="mt-0.5 text-sm text-mute">{p}</p>
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </>
  );
}
