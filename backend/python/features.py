"""Feature building and inference for TechnoExpand model v2.

Must match make_features() in ml/TechnoExpand_v2_Colab.ipynb exactly.
The .pkl files were saved with scikit-learn 1.6.1; load them with that version.
"""
import json
import os

import joblib
import numpy as np
import pandas as pd

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

with open(os.path.join(BASE_DIR, "model_config.json")) as fh:
    CONFIG = json.load(fh)

METRICS = CONFIG["metrics_used"]
FEATURES = CONFIG["features"]
RUL_CAP = CONFIG["rul_cap_days"]
T_WARNING = CONFIG["threshold_warning"]
T_CRITICAL = CONFIG["threshold_critical"]

_models = {}


def models():
    """Load the two models once and reuse them."""
    if not _models:
        _models["failure"] = joblib.load(os.path.join(BASE_DIR, "failure_model.pkl"))
        _models["rul"] = joblib.load(os.path.join(BASE_DIR, "rul_model.pkl"))
    return _models["failure"], _models["rul"]


def make_features(data: pd.DataFrame) -> pd.DataFrame:
    """Per-machine time features. `data` must be sorted by device and date."""
    g = data.groupby("device", sort=False)
    out = pd.DataFrame(index=data.index)
    for m in METRICS:
        s = g[m]
        out[m] = data[m]
        out[f"{m}_diff1"] = s.diff().fillna(0)
        for w in (3, 7, 14):
            roll = s.rolling(w, min_periods=1)
            out[f"{m}_mean{w}"] = roll.mean().reset_index(level=0, drop=True)
            out[f"{m}_max{w}"] = roll.max().reset_index(level=0, drop=True)
        out[f"{m}_std7"] = s.rolling(7, min_periods=2).std().reset_index(level=0, drop=True).fillna(0)
        out[f"{m}_cummax"] = s.cummax()
        out[f"{m}_dev_from_first"] = data[m] - s.transform("first")
    out["day_idx"] = (data["date"] - g["date"].transform("min")).dt.days
    out["record_len_so_far"] = g.cumcount() + 1
    return out


def predict_machine(history) -> dict:
    """history: list of dicts or DataFrame with date, metric1..metric9 (device optional),
    ordered or not, one row per day. Uses the latest day. At least 14 days recommended."""
    h = pd.DataFrame(history).copy()
    if h.empty:
        raise ValueError("history is empty")
    missing = [c for c in ["date", *METRICS] if c not in h.columns]
    if missing:
        raise ValueError(f"missing columns: {missing}")
    if "device" not in h.columns:
        h["device"] = "machine"
    h["date"] = pd.to_datetime(h["date"])
    h = h.sort_values(["device", "date"]).reset_index(drop=True)
    x = make_features(h)[FEATURES].values[-1:]
    failure_model, rul_model = models()
    p = float(failure_model.predict_proba(x)[0, 1])
    rul = float(np.clip(rul_model.predict(x)[0], 0, RUL_CAP))
    condition = "Critical" if p >= T_CRITICAL else "Warning" if p >= T_WARNING else "Healthy"
    return {
        "failure_prob_pct": round(100 * p, 1),
        "health_pct": round(100 * (1 - p), 1),
        "condition": condition,
        "rul_days": round(rul, 1),
        "days_used": int(len(h)),
    }
