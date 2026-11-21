# %% [markdown]
# # TechnoExpand v2 — Machine failure prediction, Health % and RUL
#
# **Dataset:** [Predictive Maintenance Dataset](https://www.kaggle.com/datasets/hiimanshuagarwal/predictive-maintenance-dataset) (Himanshu Agarwal, Kaggle, MIT licence)
#
# For every machine (device) and day, this notebook predicts:
#
# | Output | Meaning |
# |---|---|
# | `failure_prob_pct` | Probability (%) that the machine fails within the next 7 days |
# | `health_pct` | 100 − failure probability |
# | `condition` | Healthy / Warning / Critical (thresholds tuned on validation machines) |
# | `rul_days` | Remaining useful life in days (capped at 30) |
#
# **What changed from the first notebook**
# 1. Labels come from real failures. The old "Medium" label was `row average > mean`, which is just a threshold on metric1.
# 2. Train / validation / test are split **by machine**, so test machines are never seen during training.
# 3. Nothing is fitted on test data (the old scaler was fitted on all rows before the split).
# 4. Each machine's history is used: day-to-day change, rolling averages, rolling max, variability.
# 5. Class imbalance is handled (class weights + tuned thresholds). Failures are only 0.085% of rows.
# 6. Proper metrics: ROC-AUC, PR-AUC, precision, recall, F1, confusion matrix, machines caught before failure, RUL error.
#
# **How to run:** Runtime → Run all. Upload `predictive_maintenance_dataset.csv` when asked. Takes about 2–4 minutes on the free CPU runtime.

# %%
# ================================
# 📌 CELL 1: Import libraries
# ================================
import json
import os
import warnings

import joblib
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import sklearn
from sklearn.ensemble import HistGradientBoostingClassifier, HistGradientBoostingRegressor, RandomForestClassifier
from sklearn.inspection import permutation_importance
from sklearn.metrics import (
    ConfusionMatrixDisplay,
    accuracy_score,
    average_precision_score,
    balanced_accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
    mean_absolute_error,
    mean_squared_error,
    precision_recall_curve,
    precision_score,
    recall_score,
    roc_auc_score,
    roc_curve,
)
from sklearn.model_selection import GroupShuffleSplit

warnings.filterwarnings("ignore")

# Settings used everywhere below
CSV_PATH = "predictive_maintenance_dataset.csv"
HORIZON = 7    # predict failure within the next 7 days (gives the maintenance team time to act)
RUL_CAP = 30   # remaining useful life is capped at 30 days ("30" = no failure expected soon)
SEED = 42      # same results on every run

# Note this version: the backend must load the .pkl files with the same scikit-learn version.
print("scikit-learn:", sklearn.__version__, "| pandas:", pd.__version__, "| numpy:", np.__version__)

# %%
# ================================
# 📌 CELL 2: Upload the dataset (Colab only)
# ================================
# Skipped automatically if the CSV is already in the working folder.
if not os.path.exists(CSV_PATH):
    from google.colab import files

    uploaded = files.upload()  # choose predictive_maintenance_dataset.csv
    CSV_PATH = next(iter(uploaded))
print("Using:", CSV_PATH)

# %%
# ================================
# 📌 CELL 3: Load and explore the dataset
# ================================
df = pd.read_csv(CSV_PATH)
df["date"] = pd.to_datetime(df["date"])

# Sort so every machine's rows are in date order (needed for time features)
df = df.sort_values(["device", "date"]).reset_index(drop=True)

print("Rows:", len(df), "| Machines:", df["device"].nunique())
print("Date range:", df["date"].min().date(), "to", df["date"].max().date())
print("Failures:", int(df["failure"].sum()), f"({100 * df['failure'].mean():.3f}% of rows)")
print("metric7 and metric8 identical:", bool((df["metric7"] == df["metric8"]).all()))
df.head()

# %%
# ================================
# 📌 CELL 4: Create the targets
# ================================
# Target 1 (classification): will this machine fail within the next HORIZON days?
# Target 2 (regression):     how many days until the next failure (capped at RUL_CAP)?
#
# For machines with no failure ahead, rows at least RUL_CAP days before the end of their record
# get RUL = RUL_CAP. Their last RUL_CAP days are left out of RUL training, because we cannot know
# what happened after the data ends.

grp = df.groupby("device", sort=False)
df["day_idx"] = (df["date"] - grp["date"].transform("min")).dt.days

next_fail_date = df["date"].where(df["failure"] == 1).groupby(df["device"]).bfill()
days_to_fail = (next_fail_date - df["date"]).dt.days
days_to_end = (grp["date"].transform("max") - df["date"]).dt.days

df["fail_within_h"] = ((days_to_fail >= 0) & (days_to_fail <= HORIZON)).astype(int)
df["rul"] = np.where(
    days_to_fail.notna(),
    np.minimum(days_to_fail, RUL_CAP),
    np.where(days_to_end >= RUL_CAP, RUL_CAP, np.nan),
)

print(f"Rows labelled 'fails within {HORIZON} days':", int(df["fail_within_h"].sum()))
print("Rows usable for RUL training:", int(df["rul"].notna().sum()))

# %%
# ================================
# 📌 CELL 5: Feature engineering (each machine's own history)
# ================================
# Only past and current readings are used, never future ones.
# metric8 is dropped because it is an exact copy of metric7.

METRICS = ["metric1", "metric2", "metric3", "metric4", "metric5", "metric6", "metric7", "metric9"]


def make_features(data: pd.DataFrame) -> pd.DataFrame:
    """Build time features per machine. `data` must be sorted by device and date."""
    g = data.groupby("device", sort=False)
    out = pd.DataFrame(index=data.index)
    for m in METRICS:
        s = g[m]
        out[m] = data[m]                                    # today's reading
        out[f"{m}_diff1"] = s.diff().fillna(0)              # change since yesterday
        for w in (3, 7, 14):
            roll = s.rolling(w, min_periods=1)
            out[f"{m}_mean{w}"] = roll.mean().reset_index(level=0, drop=True)  # recent average
            out[f"{m}_max{w}"] = roll.max().reset_index(level=0, drop=True)    # recent peak
        out[f"{m}_std7"] = s.rolling(7, min_periods=2).std().reset_index(level=0, drop=True).fillna(0)  # 7-day variability
        out[f"{m}_cummax"] = s.cummax()                     # highest value so far
        out[f"{m}_dev_from_first"] = data[m] - s.transform("first")  # drift since the machine's first day
    out["day_idx"] = (data["date"] - g["date"].transform("min")).dt.days  # machine age in the data
    out["record_len_so_far"] = g.cumcount() + 1
    return out


features = make_features(df)
FEATURES = list(features.columns)
X = features.values
y = df["fail_within_h"].values
print("Number of features:", len(FEATURES))

# %%
# ================================
# 📌 CELL 6: Split BY MACHINE — 60% train, 20% validation, 20% test
# ================================
# A machine appears in only one of the three sets, so the test score shows
# how the model behaves on machines it has never seen.
groups = df["device"].values
all_idx = np.arange(len(df))
trval_idx, test_idx = next(GroupShuffleSplit(n_splits=1, test_size=0.2, random_state=SEED).split(all_idx, groups=groups))
tr_rel, va_rel = next(GroupShuffleSplit(n_splits=1, test_size=0.25, random_state=SEED).split(trval_idx, groups=groups[trval_idx]))
train_idx, val_idx = trval_idx[tr_rel], trval_idx[va_rel]

for name, part in (("Train", train_idx), ("Validation", val_idx), ("Test", test_idx)):
    print(
        f"{name:>10}: rows={len(part):>6} machines={len(set(groups[part])):>4} "
        f"failures={int(df['failure'].values[part].sum()):>3} positive rows={int(y[part].sum())}"
    )

# %%
# ================================
# 📌 CELL 7: Train two models and keep the better one
# ================================
# Both use class weights so the rare failure rows count more.
# The winner is chosen on validation PR-AUC (the right score when positives are rare).
candidates = {
    "HistGradientBoosting": HistGradientBoostingClassifier(
        learning_rate=0.05, max_iter=400, max_leaf_nodes=31, min_samples_leaf=40,
        l2_regularization=1.0, class_weight="balanced", random_state=SEED,
    ),
    "RandomForest": RandomForestClassifier(
        n_estimators=400, min_samples_leaf=5, max_features="sqrt",
        class_weight="balanced_subsample", n_jobs=-1, random_state=SEED,
    ),
}
val_pr_auc = {}
for name, model in candidates.items():
    model.fit(X[train_idx], y[train_idx])
    p = model.predict_proba(X[val_idx])[:, 1]
    val_pr_auc[name] = average_precision_score(y[val_idx], p)
    print(f"{name:>20}: validation PR-AUC={val_pr_auc[name]:.4f}  ROC-AUC={roc_auc_score(y[val_idx], p):.4f}")

best_name = max(val_pr_auc, key=val_pr_auc.get)
failure_model = candidates[best_name]
print("\nSelected model:", best_name)

# %%
# ================================
# 📌 CELL 8: Choose the Warning and Critical thresholds (validation machines only)
# ================================
# Critical = the probability threshold with the best F1 score (real alert).
# Warning  = a lower threshold that catches at least 60% of pre-failure days (watch list).
p_val = failure_model.predict_proba(X[val_idx])[:, 1]
prec, rec, thr = precision_recall_curve(y[val_idx], p_val)
f1_curve = 2 * prec[:-1] * rec[:-1] / np.clip(prec[:-1] + rec[:-1], 1e-9, None)
T_CRITICAL = float(thr[np.argmax(f1_curve)])
reach = np.where(rec[:-1] >= 0.60)[0]
T_WARNING = float(min(thr[reach[-1]], T_CRITICAL)) if len(reach) else T_CRITICAL / 2
print(f"Warning threshold:  {T_WARNING:.4f}")
print(f"Critical threshold: {T_CRITICAL:.4f}")

# %%
# ================================
# 📌 CELL 9: Final test on unseen machines
# ================================
# Retrain on train + validation, keep the thresholds from CELL 8, then score the test machines once.
failure_model.fit(X[trval_idx], y[trval_idx])
p_test = failure_model.predict_proba(X[test_idx])[:, 1]
alert = (p_test >= T_CRITICAL).astype(int)
y_test = y[test_idx]

results = {
    "model": best_name,
    "horizon_days": HORIZON,
    "test_rows": int(len(test_idx)),
    "test_machines": int(len(set(groups[test_idx]))),
    "test_positive_rows": int(y_test.sum()),
    "roc_auc": float(roc_auc_score(y_test, p_test)),
    "pr_auc": float(average_precision_score(y_test, p_test)),
    "pr_auc_random_guess": float(y_test.mean()),
    "precision": float(precision_score(y_test, alert, zero_division=0)),
    "recall": float(recall_score(y_test, alert)),
    "f1": float(f1_score(y_test, alert)),
    "balanced_accuracy": float(balanced_accuracy_score(y_test, alert)),
    "accuracy": float(accuracy_score(y_test, alert)),
    "confusion_matrix": confusion_matrix(y_test, alert).tolist(),
    "threshold_warning": T_WARNING,
    "threshold_critical": T_CRITICAL,
}
for k, v in results.items():
    print(f"{k:>22}: {round(v, 4) if isinstance(v, float) else v}")

print("\nClassification report (1 = fails within", HORIZON, "days):\n")
print(classification_report(y_test, alert, digits=3))
print("Note: accuracy is high only because almost every row is 'no failure'. Use recall, precision, F1 and PR-AUC.")

# %%
# ================================
# 📌 CELL 10: Charts — confusion matrix, ROC curve, precision-recall curve
# ================================
fig, axes = plt.subplots(1, 3, figsize=(17, 4.8))

ConfusionMatrixDisplay(confusion_matrix(y_test, alert), display_labels=["No failure", f"Fail ≤ {HORIZON} d"]).plot(
    ax=axes[0], cmap="Blues", colorbar=False
)
axes[0].set_title("Confusion matrix (test machines)")

fpr, tpr, _ = roc_curve(y_test, p_test)
axes[1].plot(fpr, tpr, label=f"Model (AUC {results['roc_auc']:.3f})")
axes[1].plot([0, 1], [0, 1], "--", color="grey", label="Random (AUC 0.500)")
axes[1].set_xlabel("False positive rate")
axes[1].set_ylabel("True positive rate (recall)")
axes[1].set_title("ROC curve")
axes[1].legend()

pr, rc, _ = precision_recall_curve(y_test, p_test)
axes[2].plot(rc, pr, label=f"Model (PR-AUC {results['pr_auc']:.3f})")
axes[2].axhline(results["pr_auc_random_guess"], ls="--", color="grey", label=f"Random ({results['pr_auc_random_guess']:.3f})")
axes[2].set_xlabel("Recall")
axes[2].set_ylabel("Precision")
axes[2].set_title("Precision-recall curve")
axes[2].legend()

plt.tight_layout()
plt.savefig("technoexpand_v2_charts.png", dpi=130)
plt.show()

# %%
# ================================
# 📌 CELL 11: Machine-level result — were failing machines flagged in time?
# ================================
test_df = df.iloc[test_idx][["device", "date", "failure", "fail_within_h"]].copy()
test_df["alert"] = alert

failing_machines = test_df.loc[test_df["failure"] == 1, "device"].unique()
caught, lead_days = [], []
for d in failing_machines:
    window = test_df[(test_df["device"] == d) & (test_df["fail_within_h"] == 1)]
    if window["alert"].any():
        caught.append(d)
        fail_day = test_df.loc[(test_df["device"] == d) & (test_df["failure"] == 1), "date"].min()
        lead_days.append((fail_day - window.loc[window["alert"] == 1, "date"].min()).days)

normal_days = int((test_df["fail_within_h"] == 0).sum())
false_alarms = int(((test_df["alert"] == 1) & (test_df["fail_within_h"] == 0)).sum())
results["failing_test_machines"] = int(len(failing_machines))
results["failing_machines_caught"] = int(len(caught))
results["machine_recall"] = len(caught) / max(1, len(failing_machines))
results["median_warning_days"] = float(np.median(lead_days)) if lead_days else None
results["false_alarms_per_1000_normal_days"] = 1000 * false_alarms / max(1, normal_days)

print(f"Failing machines in test set:  {len(failing_machines)}")
print(f"Flagged before failure:        {len(caught)} ({100 * results['machine_recall']:.0f}%)")
print(f"Median warning time:           {results['median_warning_days']} days")
print(f"False alarms per 1,000 normal machine-days: {results['false_alarms_per_1000_normal_days']:.1f}")

# %%
# ================================
# 📌 CELL 12: Remaining Useful Life (RUL) model
# ================================
has_rul = df["rul"].notna().values
rul_train = trval_idx[has_rul[trval_idx]]
rul_test = test_idx[has_rul[test_idx]]

rul_model = HistGradientBoostingRegressor(
    learning_rate=0.05, max_iter=400, max_leaf_nodes=31, min_samples_leaf=40, random_state=SEED
)
# Rows close to a failure are rare, so they get more weight; otherwise the model just predicts 30.
weights = np.where(df["rul"].values[rul_train] < RUL_CAP, 20.0, 1.0)
rul_model.fit(X[rul_train], df["rul"].values[rul_train], sample_weight=weights)

rul_pred = np.clip(rul_model.predict(X[rul_test]), 0, RUL_CAP)
rul_true = df["rul"].values[rul_test]
near = rul_true < RUL_CAP  # rows within 30 days of a real failure

results["rul_mae_near_failure_days"] = float(mean_absolute_error(rul_true[near], rul_pred[near]))
results["rul_rmse_near_failure_days"] = float(np.sqrt(mean_squared_error(rul_true[near], rul_pred[near])))
results["rul_mae_baseline_always_30"] = float(mean_absolute_error(rul_true[near], np.full(near.sum(), RUL_CAP)))
results["rul_mae_all_rows_days"] = float(mean_absolute_error(rul_true, rul_pred))

print(f"RUL error near failure (MAE):  {results['rul_mae_near_failure_days']:.2f} days")
print(f"RUL error near failure (RMSE): {results['rul_rmse_near_failure_days']:.2f} days")
print(f"Baseline 'always 30 days' MAE: {results['rul_mae_baseline_always_30']:.2f} days")
print(f"RUL error on all test rows:    {results['rul_mae_all_rows_days']:.2f} days (flattering: most rows are 30)")

plt.figure(figsize=(6, 4.5))
plt.scatter(rul_true[near], rul_pred[near], s=8, alpha=0.5)
plt.plot([0, RUL_CAP], [0, RUL_CAP], "--", color="grey")
plt.xlabel("Actual days to failure")
plt.ylabel("Predicted RUL (days)")
plt.title("RUL on test machines (last 30 days before failure)")
plt.tight_layout()
plt.savefig("technoexpand_v2_rul.png", dpi=130)
plt.show()

# %%
# ================================
# 📌 CELL 13: Which signals matter most? (permutation importance)
# ================================
rng = np.random.default_rng(SEED)
pos = test_idx[y_test == 1]
neg = rng.choice(test_idx[y_test == 0], size=min(4000, int((y_test == 0).sum())), replace=False)
sample_idx = np.concatenate([pos, neg])
imp = permutation_importance(
    failure_model, X[sample_idx], y[sample_idx], scoring="average_precision", n_repeats=3, random_state=SEED, n_jobs=-1
)
top = sorted(zip(FEATURES, imp.importances_mean), key=lambda t: -t[1])[:10]
results["top_features"] = [[f, float(v)] for f, v in top]

plt.figure(figsize=(7, 4.5))
plt.barh([f for f, _ in top][::-1], [v for _, v in top][::-1])
plt.xlabel("Drop in PR-AUC when shuffled")
plt.title("Top 10 features")
plt.tight_layout()
plt.savefig("technoexpand_v2_features.png", dpi=130)
plt.show()

# %%
# ================================
# 📌 CELL 14: Save the new model files
# ================================
config = {
    "features": FEATURES,
    "metrics_used": METRICS,
    "horizon_days": HORIZON,
    "rul_cap_days": RUL_CAP,
    "threshold_warning": T_WARNING,
    "threshold_critical": T_CRITICAL,
    "model": best_name,
    "sklearn_version": sklearn.__version__,
    "trained_on": CSV_PATH,
}
joblib.dump(failure_model, "failure_model.pkl")
joblib.dump(rul_model, "rul_model.pkl")
with open("model_config.json", "w") as fh:
    json.dump(config, fh, indent=1)
with open("metrics.json", "w") as fh:
    json.dump(results, fh, indent=1, default=float)
print("Saved: failure_model.pkl, rul_model.pkl, model_config.json, metrics.json")

# %%
# ================================
# 📌 CELL 15: Use the model — one machine's recent history -> dashboard values
# ================================
# Needs the machine's recent days (at least 14 for the rolling features).


def predict_machine(history: pd.DataFrame) -> dict:
    h = history.copy()
    h["date"] = pd.to_datetime(h["date"])
    h = h.sort_values(["device", "date"]).reset_index(drop=True)
    x = make_features(h)[FEATURES].values[-1:]
    p = float(failure_model.predict_proba(x)[0, 1])
    rul = float(np.clip(rul_model.predict(x)[0], 0, RUL_CAP))
    if p >= T_CRITICAL:
        condition = "Critical"
    elif p >= T_WARNING:
        condition = "Warning"
    else:
        condition = "Healthy"
    return {
        "failure_prob_pct": round(100 * p, 1),
        "health_pct": round(100 * (1 - p), 1),
        "condition": condition,
        "rul_days": round(rul, 1),
    }


# Example on machines from the TEST set (never seen in training)
test_machines = sorted(set(groups[test_idx]))
failing = [d for d in test_machines if d in set(failing_machines)]
healthy = [d for d in test_machines if d not in set(failing_machines)]

for d in failing[:3]:
    hist = df[df["device"] == d]
    fail_day = hist.loc[hist["failure"] == 1, "date"].iloc[0]
    print(d, "| 2 days before failure ->", predict_machine(hist[hist["date"] <= fail_day - pd.Timedelta(days=2)]))
for d in healthy[:2]:
    print(d, "| healthy machine, latest day ->", predict_machine(df[df["device"] == d]))

# %%
# ================================
# 📌 CELL 16: Download the files (Colab only)
# ================================
try:
    from google.colab import files

    for name in [
        "failure_model.pkl", "rul_model.pkl", "model_config.json", "metrics.json",
        "technoexpand_v2_charts.png", "technoexpand_v2_rul.png", "technoexpand_v2_features.png",
    ]:
        files.download(name)
except ImportError:
    print("Not running in Colab: files are in", os.getcwd())
