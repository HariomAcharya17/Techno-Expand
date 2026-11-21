"""Build frontend/public/replay.json: real readings + model v2 predictions for 15 unseen test machines.

Usage (needs scikit-learn==1.6.1, the version the .pkl files were saved with):
    python ml/build_replay.py predictive_maintenance_dataset.csv

Machines are taken from the TEST split of ml/TechnoExpand_v2_Colab.ipynb (never seen in training):
  * the 6 failing test machines with the longest history, and
  * the 9 non-failing test machines with the longest history.
Every value in the output is either a dataset reading or a model prediction. Nothing is invented.
"""
import json
import os
import sys
import warnings

import numpy as np
import pandas as pd
from sklearn.model_selection import GroupShuffleSplit

warnings.filterwarnings("ignore")
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "backend", "python"))
from features import CONFIG, FEATURES, RUL_CAP, make_features, models  # noqa: E402

N_FAILING, N_HEALTHY, SEED = 6, 9, 42
START = pd.Timestamp("2015-01-01")

df = pd.read_csv(sys.argv[1])
df["date"] = pd.to_datetime(df["date"])
df = df.sort_values(["device", "date"]).reset_index(drop=True)

# Same split as the notebook
groups = df["device"].values
_, test_idx = next(GroupShuffleSplit(n_splits=1, test_size=0.2, random_state=SEED).split(np.arange(len(df)), groups=groups))
test_devices = set(groups[test_idx])

lengths = df[df.device.isin(test_devices)].groupby("device").size()
failed = set(df.loc[(df.failure == 1) & df.device.isin(test_devices), "device"])
pick_fail = sorted(failed, key=lambda d: (-lengths[d], d))[:N_FAILING]
pick_ok = sorted(test_devices - failed, key=lambda d: (-lengths[d], d))[:N_HEALTHY]
picked = pick_fail + pick_ok

X = make_features(df)[FEATURES].values
clf, reg = models()

grp = df.groupby("device", sort=False)
next_fail = df["date"].where(df["failure"] == 1).groupby(df["device"]).bfill()
days_to_fail = (next_fail - df["date"]).dt.days

machines = []
for d in picked:
    rows = df.index[df.device == d].values
    p = clf.predict_proba(X[rows])[:, 1]
    rul = np.clip(reg.predict(X[rows]), 0, RUL_CAP)
    dtf = days_to_fail.values[rows]
    sub = df.loc[rows]
    fail_dates = sub.loc[sub["failure"] == 1, "date"]
    machines.append({
        "device": d,
        "failed": bool(len(fail_dates)),
        "failureDay": int((fail_dates.iloc[0] - START).days) if len(fail_dates) else None,
        "day": [int((t - START).days) for t in df.loc[rows, "date"]],
        "metrics": {m: [int(v) for v in df.loc[rows, m]] for m in CONFIG["metrics_used"]},
        "p": [int(round(v * 1000)) for v in p],          # failure probability x 1000
        "rul": [int(round(v * 10)) for v in rul],         # predicted RUL days x 10
        "rulTrue": [None if np.isnan(v) or v > RUL_CAP else int(v) for v in dtf],  # actual days to failure (<= 30)
    })

out = {
    "source": "Predictive Maintenance Dataset (Kaggle, Himanshu Agarwal, MIT). Predictions: model v2 (ml/TechnoExpand_v2_Colab.ipynb).",
    "selection": f"{N_FAILING} failing + {N_HEALTHY} non-failing machines with the longest history, all from the unseen test split.",
    "startDate": str(START.date()),
    "endDay": int(max(max(m["day"]) for m in machines)),
    "thresholdWarning": CONFIG["threshold_warning"],
    "thresholdCritical": CONFIG["threshold_critical"],
    "horizonDays": CONFIG["horizon_days"],
    "rulCapDays": RUL_CAP,
    "metrics": CONFIG["metrics_used"],
    "machines": machines,
}
dest = os.path.join(ROOT, "frontend", "public", "replay.json")
with open(dest, "w") as fh:
    json.dump(out, fh, separators=(",", ":"))
print("wrote", dest, os.path.getsize(dest) // 1024, "KB")
for m in machines:
    crit = sum(v >= 1000 * CONFIG["threshold_critical"] for v in m["p"])
    print(m["device"], "failed" if m["failed"] else "ok", "days", len(m["day"]), "range", m["day"][0], m["day"][-1], "failureDay", m["failureDay"], "critical days", crit)
