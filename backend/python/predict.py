import sys
import json
import joblib
import numpy as np
import os
import warnings
warnings.filterwarnings("ignore")

# Correct base directory for files
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Load trained model and scaler
model = joblib.load(os.path.join(BASE_DIR, "model.pkl"))
scaler = joblib.load(os.path.join(BASE_DIR, "scaler.pkl"))

# Read input data sent from Node.js
data_json = sys.argv[1]
data = json.loads(data_json)

# Extract sensor values safely
sample = np.array([
    data.get("metric1", 0),
    data.get("metric2", 0),
    data.get("metric3", 0),
    data.get("metric4", 0),
    data.get("metric5", 0),
    data.get("metric6", 0),
    data.get("metric7", 0),
    data.get("metric8", 0),
    data.get("metric9", 0)
]).reshape(1, -1)

# Scale values using saved scaler
sample_scaled = scaler.transform(sample)

# Predict the condition class → 0, 1, 2
prediction = int(model.predict(sample_scaled)[0])

mapping = {
    0: "Healthy",
    1: "Medium",
    2: "Fail"
}

# HEALTH/FALIURE PERCENT MAPPING
if prediction == 0:
    health = np.random.randint(80, 101)
elif prediction == 1:
    health = np.random.randint(40, 76)
else:
    health = np.random.randint(0, 31)

failure = 100 - health

result = {
    "class": prediction,
    "condition": mapping[prediction],
    "health": int(health),
    "failure": int(failure)
}

print(json.dumps(result))