# ML evaluation scripts

Dataset: [Predictive Maintenance Dataset](https://www.kaggle.com/datasets/hiimanshuagarwal/predictive-maintenance-dataset) (Himanshu Agarwal, Kaggle, MIT licence). Not committed to the repo; download `predictive_maintenance_dataset.csv` from Kaggle.

- `evaluate_original.py <csv> <model_dir>`: re-creates the original 3-class labels (Fail = `failure` 1; Medium = row mean of the 9 metrics above its overall mean, as in the Colab notebook; else Healthy), retrains the original pipeline (StandardScaler + RandomForest, 200 trees, `random_state=42`) and evaluates on the same non-stratified 80/20 split as the notebook (scaler fitted on all rows) and on a device-held-out 80/20 split. Output: `metrics_original.json`.
- `train_failure_7day.py <csv>`: improved model. Target = device fails within the next 7 days; per-device diff and 7-day rolling features; class-balanced RandomForest; decision threshold tuned on a validation split of training devices; evaluated on unseen devices. Output: `metrics_failure_7day.json`.

The numbers on the website's Case Study page come from these two JSON files (`frontend/src/data/caseStudy.js`).
