"""Predict one machine's condition from its recent daily readings (model v2).

Usage:
    python predict.py history.json          # file with a JSON list of daily rows
    cat history.json | python predict.py    # or via stdin

Each row: {"date": "2015-03-01", "metric1": ..., ..., "metric9": ...}
Output: {"failure_prob_pct", "health_pct", "condition", "rul_days", "days_used"}
"""
import json
import sys
import warnings

from features import predict_machine

warnings.filterwarnings("ignore")

if __name__ == "__main__":
    raw = open(sys.argv[1]).read() if len(sys.argv) > 1 else sys.stdin.read()
    print(json.dumps(predict_machine(json.loads(raw))))
