import { FiDatabase, FiCpu, FiCloudOff, FiActivity, FiExternalLink } from "react-icons/fi";
import { Link } from "react-router-dom";
import { Panel, PageHeader } from "../components/ui";

// Edit these if you want to point to a different source.
const DATASET = {
  name: "Predictive Maintenance Dataset",
  author: "Himanshu Agarwal",
  source: "Kaggle",
  url: "https://www.kaggle.com/datasets/hiimanshuagarwal/predictive-maintenance-dataset",
  rows: "124,494 daily records (6.6 MB CSV, MIT licence)",
  devices: "1,169 devices, 106 failures, Jan–Nov 2015",
  columns: "date, device, failure, metric1 – metric9",
};

const MODEL = [
  ["Algorithm", "Random Forest classifier (scikit-learn)"],
  ["Trees", "200 estimators, max_features = sqrt, random_state = 42"],
  ["Pre-processing", "StandardScaler on all 9 input features"],
  ["Inputs", "metric1 … metric9 (anonymised telemetry counters)"],
  ["Output classes", "0 = Healthy · 1 = Medium (warning) · 2 = Fail"],
  ["Dashboard values", "Health %, failure % and RUL are ranges set for each predicted class (simulated), not model probabilities"],
];

export default function Dataset() {
  return (
    <>
      <PageHeader
        title="Dataset & Model"
        subtitle="What the machine-learning model was trained on, and how this live demo works."
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Panel title="Training dataset" action={<FiDatabase className="text-dim" size={14} />}>
          <h3 className="text-lg font-semibold">{DATASET.name}</h3>
          <dl className="mt-3 grid grid-cols-[120px_1fr] gap-y-2 text-sm">
            <dt className="text-dim">Source</dt>
            <dd>
              <a href={DATASET.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-accent hover:underline">
                {DATASET.source} · {DATASET.author} <FiExternalLink size={12} />
              </a>
            </dd>
            <dt className="text-dim">Size</dt>
            <dd className="text-mute">{DATASET.rows}</dd>
            <dt className="text-dim">Devices</dt>
            <dd className="text-mute">{DATASET.devices}</dd>
            <dt className="text-dim">Columns</dt>
            <dd className="num text-xs text-mute pt-0.5">{DATASET.columns}</dd>
          </dl>
          <p className="mt-4 text-sm text-mute leading-relaxed">
            Each row is one day of telemetry from one device, with nine anonymised sensor metrics and a failure flag.
            For training, rows were labelled Fail (recorded failure), Medium (row average of the metrics above its overall average) or Healthy. Full
            results, including accuracy, ROC-AUC and F1, are on the{" "}
            <Link to="/case-study" className="text-accent hover:underline">case study</Link> page.
          </p>
        </Panel>

        <Panel title="Model" action={<FiCpu className="text-dim" size={14} />}>
          <dl className="grid grid-cols-[130px_1fr] gap-y-2.5 text-sm">
            {MODEL.map(([k, v]) => (
              <div key={k} className="contents">
                <dt className="text-dim">{k}</dt>
                <dd className="text-mute">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 text-xs text-dim">
            Trained model files: <span className="num">backend/python/model.pkl</span>,{" "}
            <span className="num">backend/python/scaler.pkl</span> (in the project repository).
          </p>
        </Panel>
      </div>

      <Panel title="Why the dataset is not uploaded here" className="mt-4" action={<FiCloudOff className="text-dim" size={14} />}>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_1fr]">
          <p className="text-sm text-mute leading-relaxed">
            The dataset is too large to ship with this site. When it was bundled in, the deployment on Vercel’s free tier
            lagged badly, because the free plan has limited compute and is not powerful enough to load and process that
            much data for every visitor.
          </p>
          <p className="text-sm text-mute leading-relaxed">
            So this public demo leaves the raw dataset out. Instead, the browser runs a lightweight simulator that produces
            the same kind of live stream the IoT gateway sends: values per machine condition, thresholds, alarms and RUL
            decay. The trained model stays in the repository.
          </p>
        </div>
      </Panel>

      <Panel title="How this demo works" className="mt-4" action={<FiActivity className="text-dim" size={14} />}>
        <ol className="grid grid-cols-1 gap-3 text-sm md:grid-cols-3">
          {[
            ["Designed system", "ESP32 sensor nodes on each machine send readings through an edge gateway to the cloud, where the model scores them. In our prototype, a FastAPI backend streamed simulated machine data over a WebSocket."],
            ["This demo", "Real hardware and real plant data were not available, so 15 virtual machines stream simulated readings every 2 seconds, with fixed conditions taken from the model’s classes."],
            ["Sensor channels", "The dataset’s metrics are anonymised, so the dashboard shows the physical channels a real deployment would log: temperature, pressure, vibration, humidity, current, voltage, speed, load and acoustic level."],
          ].map(([h, p], i) => (
            <li key={h} className="rounded border border-line bg-panel-2 p-4">
              <div className="num text-xs text-accent">0{i + 1}</div>
              <div className="mt-1 font-medium">{h}</div>
              <p className="mt-1.5 text-mute leading-relaxed">{p}</p>
            </li>
          ))}
        </ol>
      </Panel>
    </>
  );
}
