# ML

Dataset: [Predictive Maintenance Dataset](https://www.kaggle.com/datasets/hiimanshuagarwal/predictive-maintenance-dataset) (Himanshu Agarwal, Kaggle, MIT licence). Not committed; download `predictive_maintenance_dataset.csv` from Kaggle.

## Model v2 (current)

- `TechnoExpand_v2_Colab.ipynb` (same code: `TechnoExpand_v2_Colab.py`): run all cells in Google Colab.
  - Targets: failure within the next 7 days; remaining useful life (days until failure, capped at 30).
  - 90 per-machine time features; split by machine (60/20/20); class-weighted HistGradientBoosting; Warning/Critical thresholds tuned on validation machines.
  - Saves `failure_model.pkl`, `rul_model.pkl`, `model_config.json`, `metrics.json`.
- `metrics_v2_colab.json`, `model_config_v2.json`: output of the Colab run (scikit-learn 1.6.1). Re-checked by loading the saved .pkl files: every metric reproduced exactly.
- `build_replay.py <csv>`: runs model v2 on 15 unseen test machines and writes `frontend/public/replay.json`, which the live dashboard replays (needs scikit-learn 1.6.1).
- The model files are in `backend/python/` and are served by `backend/main.py` (`POST /predict`, `GET /model`) and `backend/python/predict.py`.

Test result on 234 unseen machines: ROC-AUC 0.812, PR-AUC 0.178 (random 0.006), precision 0.224, recall 0.299, F1 0.256; 10 of 18 failing machines flagged, median 6.5 days ahead; 6.0 false alarms per 1,000 normal machine-days; RUL MAE 11.2 days near failure (always guessing 30: 16.6).

## Original model (v1)

- `evaluate_original.py <csv> <model_dir>`: re-runs the first Colab notebook's pipeline (3 classes; Medium = row mean of the 9 metrics above its overall mean; StandardScaler + RandomForest, 200 trees) and adds F1, ROC-AUC and PR-AUC, plus a device-held-out split. Output: `metrics_original.json`. Its Fail-class F1 is 0.00.
- Old model files: `backend/python/legacy_v1/`.

The Case Study page reads these numbers from `frontend/src/data/caseStudy.js`.
