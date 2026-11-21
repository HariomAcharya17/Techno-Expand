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
  ["Model v2", "HistGradientBoosting classifier + regressor (scikit-learn 1.6.1), class-weighted"],
  ["Targets", "Failure within the next 7 days; remaining useful life in days (capped at 30)"],
  ["Inputs", "90 features from each machine's history (metric1 … metric9, metric8 dropped)"],
  ["Outputs", "Failure %, health % (100 − failure %), Healthy / Warning / Critical, RUL days"],
  ["Test result", "ROC-AUC 0.812 · F1 0.256 · 10 of 18 failing machines flagged, median 6.5 days ahead"],
  ["Dashboard values", "Real readings + model v2 predictions for 15 unseen test machines, precomputed and replayed day by day"],
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
            Model files: <span className="num">backend/python/failure_model.pkl</span>,{" "}
            <span className="num">backend/python/rul_model.pkl</span>, <span className="num">model_config.json</span>.
            Training notebook: <span className="num">ml/TechnoExpand_v2_Colab.ipynb</span>.
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
            So the site ships only what the dashboard needs: a 164 KB file with the daily readings of 15 machines and the
            model&apos;s prediction for each day, computed once offline by <span className="num">ml/build_replay.py</span>. The full
            dataset and the Python backend stay out of the deployment.
          </p>
        </div>
      </Panel>

      <Panel title="How this demo works" className="mt-4" action={<FiActivity className="text-dim" size={14} />}>
        <ol className="grid grid-cols-1 gap-3 text-sm md:grid-cols-3">
          {[
            ["Designed system", "ESP32 sensor nodes on each machine send readings through an edge gateway to the cloud, where the model scores them. The repository has the FastAPI backend that serves model v2 (POST /predict)."],
            ["This demo", "No plant hardware was available, so the dashboard replays real data: 15 machines from the dataset that the model never saw in training (6 that failed, 9 that did not), one day every 2 seconds, with model v2’s prediction for each day."],
            ["Sensor channels", "The dataset’s metrics are anonymised counters (metric1 … metric9) with no units, so the dashboard shows them as they are. Machine names and photos are illustrative; device IDs are the real ones."],
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
