import { Line } from "react-chartjs-2";
import { Panel, PageHeader } from "../components/ui";
import { CASE } from "../data/caseStudy";

const pct = (v, d = 1) => `${(v * 100).toFixed(d)}%`;
const n = (v) => v.toLocaleString("en-US");

const D = CASE.dataset;
const ORIG = CASE.original;
const V2 = CASE.improved;
const failRate = D.failures / D.rows;

function Fact({ label, value, note }) {
  return (
    <div className="px-4 py-3">
      <div className="text-xs text-mute">{label}</div>
      <div className="num mt-0.5 text-lg font-medium">{value}</div>
      {note && <div className="text-xs text-dim">{note}</div>}
    </div>
  );
}

function Confusion({ labels, matrix }) {
  const max = Math.max(...matrix.flat());
  return (
    <table className="num text-xs">
      <thead>
        <tr>
          <th className="p-1.5 text-left font-normal text-dim">actual \ predicted</th>
          {labels.map((l) => (
            <th key={l} className="whitespace-nowrap p-1.5 font-medium text-mute">{l}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {matrix.map((row, i) => (
          <tr key={i}>
            <th className="whitespace-nowrap p-1.5 text-left font-medium text-mute">{labels[i]}</th>
            {row.map((v, j) => {
              const a = v === 0 ? 0 : 0.08 + 0.5 * Math.log1p(v) / Math.log1p(max);
              const diag = i === j;
              return (
                <td
                  key={j}
                  className="min-w-16 border border-white p-2 text-center"
                  style={{ background: diag ? `rgba(30,142,62,${a})` : `rgba(204,51,51,${a})` }}
                >
                  {n(v)}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function MetricTable({ rows, cols }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-panel-2 text-left text-xs text-mute">
            <th className="px-4 py-2 font-medium">Metric</th>
            {cols.map((c) => (
              <th key={c} className="px-4 py-2 text-right font-medium">{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(([label, vals, hint, bad]) => (
            <tr key={label} className="border-t border-line">
              <td className="px-4 py-2">
                {label}
                {hint && <div className="text-xs text-dim">{hint}</div>}
              </td>
              {vals.map((v, i) => (
                <td key={i} className={`num px-4 py-2 text-right ${bad ? "text-crit" : ""}`}>{v}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const rocData = {
  datasets: [
    {
      label: `Improved, 7-day horizon (AUC ${V2.rocAuc.toFixed(2)})`,
      data: V2.roc.map(([x, y]) => ({ x, y })),
      borderColor: "#0b5cad",
      borderWidth: 2,
      stepped: true,
    },
    {
      label: `Original model, Fail class (AUC ${ORIG.deviceSplit.failure.rocAuc.toFixed(2)})`,
      data: ORIG.deviceSplit.failure.roc.map(([x, y]) => ({ x, y })),
      borderColor: "#c47a00",
      borderWidth: 2,
      stepped: true,
    },
    {
      label: "Random guess (AUC 0.50)",
      data: [{ x: 0, y: 0 }, { x: 1, y: 1 }],
      borderColor: "#9aa5b1",
      borderDash: [4, 4],
      borderWidth: 1,
    },
  ],
};

const rocOptions = {
  responsive: true,
  maintainAspectRatio: false,
  parsing: false,
  plugins: {
    legend: { position: "bottom", labels: { boxWidth: 14, boxHeight: 2 } },
    tooltip: { enabled: false },
  },
  elements: { point: { radius: 0 } },
  scales: {
    x: { type: "linear", min: 0, max: 1, title: { display: true, text: "False positive rate" }, grid: { color: "#edf0f3" } },
    y: { min: 0, max: 1, title: { display: true, text: "True positive rate (recall)" }, grid: { color: "#edf0f3" } },
  },
};

export default function CaseStudy() {
  const r = ORIG.randomSplit;
  const g = ORIG.deviceSplit;
  const imp = Object.entries(ORIG.importance);

  return (
    <div className="max-w-[1100px]">
      <PageHeader
        title="Case study: predicting machine failure from sensor data"
        subtitle="Approach, dataset, results and what we learned. All numbers below come from scripts in the ml/ folder of the repository."
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {[
          ["Problem", "Unplanned breakdowns stop production. Fixed-interval servicing wastes parts and labour on machines that are fine. We wanted to warn before a machine fails, using data from IoT sensors."],
          ["Approach", "Sensor nodes send readings to the cloud. A Random Forest model classifies each machine as Healthy, Medium or Fail, and the dashboard turns that into health %, failure risk and remaining useful life."],
          ["Outcome", "A trained model and a working monitoring dashboard prototype. Evaluation showed the first model's 99.9% accuracy was misleading, so we built a second model that flags 1 in 3 days in the week before a failure, on machines it never saw."],
        ].map(([h, p]) => (
          <Panel key={h} title={h}>
            <p className="text-[13px] leading-relaxed text-mute">{p}</p>
          </Panel>
        ))}
      </div>

      <Panel title="Dataset" className="mt-4" pad={false}>
        <div className="grid grid-cols-2 divide-x divide-y divide-line sm:grid-cols-3 lg:grid-cols-6 lg:divide-y-0">
          <Fact label="Daily records" value={n(D.rows)} />
          <Fact label="Devices" value={n(D.devices)} />
          <Fact label="Failures" value={n(D.failures)} note={`${pct(failRate, 3)} of rows`} />
          <Fact label="Period" value="Jan–Nov 2015" />
          <Fact label="Features" value="9" note="metric1 … metric9" />
          <Fact label="CSV size" value="6.6 MB" note="MIT licence" />
        </div>
        <p className="border-t border-line px-4 py-3 text-[13px] text-mute">
          <a
            href="https://www.kaggle.com/datasets/hiimanshuagarwal/predictive-maintenance-dataset"
            target="_blank"
            rel="noreferrer"
            className="text-accent hover:underline"
          >
            Predictive Maintenance Dataset
          </a>{" "}
          by Himanshu Agarwal on Kaggle. Each row is one device on one day, with nine anonymised sensor counters and a
          binary <span className="num">failure</span> flag. Only 1 row in about 1,170 is a failure, so the data is
          extremely imbalanced.
        </p>
      </Panel>

      <Panel title="Approach" className="mt-4">
        <ol className="space-y-3 text-[13px]">
          {[
            ["Labelling", `Three classes. Fail = a recorded failure (${D.classCounts["2"]} rows). Medium = the row average of the 9 metrics (a “stress value”) above its overall average (${n(D.classCounts["1"])} rows). Healthy = everything else (${n(D.classCounts["0"])} rows).`],
            ["Pre-processing", "StandardScaler fitted on the 9 metrics (metric7 and metric8 turned out to be identical)."],
            ["Model", "RandomForestClassifier: 200 trees, max_features = sqrt, random_state = 42 (scikit-learn)."],
            ["Evaluation", "80/20 random split by row (random_state = 42), as in the original Colab notebook. We re-ran it and added a stricter split where test devices are never seen in training."],
            ["Serving", "Model and scaler saved with joblib; predict.py loads them and classifies a set of sensor readings. The prototype FastAPI backend streamed simulated machine data (fixed conditions per machine) over a WebSocket to the React dashboard. Connecting the model to the live stream is a next step."],
          ].map(([h, p], i) => (
            <li key={h} className="flex gap-3">
              <span className="num w-5 shrink-0 text-dim">{i + 1}.</span>
              <div>
                <span className="font-medium">{h}.</span> <span className="text-mute">{p}</span>
              </div>
            </li>
          ))}
        </ol>
      </Panel>

      <h2 className="mb-2 mt-6 text-base font-semibold">Results: original model</h2>
      <Panel pad={false}>
        <MetricTable
          cols={[`Random split, as in notebook (${n(r.testRows)} rows)`, `Unseen devices (${n(g.testRows)} rows)`]}
          rows={[
            ["Accuracy", [pct(r.accuracy, 2), pct(g.accuracy, 2)]],
            ["Weighted F1", [r.weightedF1.toFixed(3), g.weightedF1.toFixed(3)], "Weighted by class size"],
            ["Macro F1", [r.macroF1.toFixed(3), g.macroF1.toFixed(3)], "Each class counts equally"],
            ["ROC-AUC (one-vs-rest, macro)", [r.rocAucOvr.toFixed(3), g.rocAucOvr.toFixed(3)]],
            ["Fail class: precision", [r.perClass.Fail.precision.toFixed(2), g.perClass.Fail.precision.toFixed(2)], null, true],
            ["Fail class: recall", [r.perClass.Fail.recall.toFixed(2), g.perClass.Fail.recall.toFixed(2)], `${r.testFailures} and ${g.testFailures} failures in the test sets`, true],
            ["Fail class: F1", [r.perClass.Fail.f1.toFixed(2), g.perClass.Fail.f1.toFixed(2)], null, true],
            ["Fail class: ROC-AUC", [r.failure.rocAuc.toFixed(3), g.failure.rocAuc.toFixed(3)]],
          ]}
        />
      </Panel>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel title="Confusion matrix, unseen devices">
          <Confusion labels={["Healthy", "Medium", "Fail"]} matrix={g.confusion} />
          <p className="mt-3 text-[13px] text-mute">
            Healthy and Medium are almost perfect. All {g.testFailures} real failures were predicted as Healthy or Medium.
          </p>
        </Panel>
        <Panel title="What the model actually learned">
          <div className="space-y-1.5">
            {imp.slice(0, 5).map(([f, v]) => (
              <div key={f} className="flex items-center gap-3 text-xs">
                <span className="num w-16 text-mute">{f}</span>
                <div className="h-2 flex-1 bg-[#e6eaee]">
                  <div className="h-full bg-accent" style={{ width: `${Math.max(0.5, v * 100)}%` }} />
                </div>
                <span className="num w-12 text-right">{pct(v)}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[13px] text-mute">
            {pct(imp[0][1])} of the model's decisions rely on metric1. Its values are in the hundreds of millions, so it
            decides the row average that defined the Medium label. The model learned that labelling rule, not the signs of failure.
          </p>
        </Panel>
      </div>

      <Panel title="Why 99.9% accuracy was misleading" className="mt-4">
        <div className="grid grid-cols-1 gap-4 text-[13px] leading-relaxed text-mute md:grid-cols-2">
          <p>
            Failures are only {pct(failRate, 3)} of the data. A model that never predicts a failure still scores above 99.9%
            accuracy, so accuracy and weighted F1 say almost nothing here. The metrics that matter are recall, precision
            and F1 for the failure class, and the precision-recall curve.
          </p>
          <p>
            The Medium class was defined by a threshold on the row average of the metrics, which is almost entirely metric1, so it is easy to learn and pushes accuracy and
            macro ROC-AUC up. It does not describe real wear. The deployed dashboard still uses this first model's three
            classes for its Healthy, Warning and Critical states.
          </p>
        </div>
      </Panel>

      <h2 className="mb-2 mt-6 text-base font-semibold">Improved model: failure within the next 7 days</h2>
      <Panel pad={false}>
        <div className="px-4 py-3 text-[13px] leading-relaxed text-mute">
          Changes: (1) the target became “this device fails within the next 7 days”, which gives a maintenance team time to
          act; (2) per-device features: day-to-day change, 7-day rolling mean and max, device age; (3) class-balanced
          Random Forest (300 trees); (4) decision threshold ({V2.threshold.toFixed(2)}) tuned on validation devices, then
          tested on unseen devices.
        </div>
        <div className="border-t border-line">
          <MetricTable
            cols={["Original (Fail class)", "Improved (7-day)"]}
            rows={[
              ["Recall", [pct(g.failure.recall, 0), pct(V2.recall, 1)], "Share of real failures caught"],
              ["Precision", [pct(g.failure.precision, 0), pct(V2.precision, 1)], "Share of alerts that were real"],
              ["F1 score", [g.failure.f1.toFixed(2), V2.f1.toFixed(2)]],
              ["ROC-AUC", [g.failure.rocAuc.toFixed(3), V2.rocAuc.toFixed(3)]],
              ["PR-AUC", [g.failure.prAuc.toFixed(3), V2.prAuc.toFixed(3)], `Random guess ≈ ${(V2.positives / V2.testRows).toFixed(3)}`],
            ]}
          />
        </div>
      </Panel>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel title="ROC curve, unseen devices">
          <div className="h-80">
            <Line data={rocData} options={rocOptions} />
          </div>
        </Panel>
        <Panel title="Confusion matrix, improved model">
          <Confusion labels={["No failure", "Failure ≤ 7 d"]} matrix={V2.confusion} />
          <p className="mt-3 text-[13px] leading-relaxed text-mute">
            {V2.confusion[1][1]} of {V2.positives} pre-failure days flagged, with {V2.confusion[0][1]} false alarms out of{" "}
            {n(V2.confusion[0][0] + V2.confusion[0][1])} normal days ({pct(V2.confusion[0][1] / (V2.confusion[0][0] + V2.confusion[0][1]), 1)} false-alarm rate).
          </p>
          <div className="mt-4 text-xs text-mute">Most useful features</div>
          <ul className="num mt-1 grid grid-cols-2 gap-x-4 text-xs text-ink">
            {V2.importance.slice(0, 6).map(([f]) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </Panel>
      </div>

      <Panel title="Lessons and next steps" className="mt-4">
        <ul className="list-disc space-y-1.5 pl-5 text-[13px] leading-relaxed text-mute">
          <li>On rare-event problems, report recall, precision, F1 and PR-AUC for the rare class. Accuracy hides failure.</li>
          <li>Test on machines the model has never seen. Random row splits leak information from the same device.</li>
          <li>Labels must come from real outcomes, such as failures or maintenance logs, not from a threshold on an input feature.</li>
          <li>Trends over time (rolling windows, rate of change) carry more signal than a single day's reading.</li>
          <li>Next: collect real sensor data from our ESP32 nodes, use maintenance records as labels, and try gradient boosting and survival models to estimate remaining useful life directly.</li>
        </ul>
      </Panel>
    </div>
  );
}
