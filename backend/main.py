from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import json
import random
import joblib
import numpy as np
import os
from datetime import datetime, timedelta

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
model = joblib.load(os.path.join(BASE_DIR, "python", "model.pkl"))
scaler = joblib.load(os.path.join(BASE_DIR, "python", "scaler.pkl"))


# ---------------------------------------------
# MACHINE CONFIGURATION
# ---------------------------------------------
MACHINE_NAMES = {
    "M1": "CNC Milling Machine",
    "M2": "Air Compressor",
    "M3": "Centrifugal Pump",
    "M4": "Injection Molding Machine",
    "M5": "Industrial Boiler",
    "M6": "Conveyor System",
    "M7": "Hydraulic Press",
    "M8": "Cooling Tower",
    "M9": "Industrial Robot Arm",
    "M10": "Steam Turbine",
    "M11": "Electric Motor",
    "M12": "Heat Exchanger",
    "M13": "Reciprocating Pump",
    "M14": "Industrial Chiller",
    "M15": "Rotary Kiln",
}

FIXED_CONDITIONS = {
    "M1": "Healthy",
    "M2": "Healthy",
    "M3": "Medium",
    "M4": "Fail",
    "M5": "Healthy",
    "M6": "Fail",
    "M7": "Healthy",
    "M8": "Fail",
    "M9": "Healthy",
    "M10": "Fail",
    "M11": "Healthy",
    "M12": "Healthy",
    "M13": "Healthy",
    "M14": "Healthy",
    "M15": "Fail",
}

# ---------------------------------------------
# REALISTIC SENSOR MODEL
# ---------------------------------------------
SENSORS = {
    "temperature": [40, 0.2],     # base, slow drift
    "pressure": [1.5, 0.03],
    "vibration": [9, 0.08],
    "humidity": [50, 0.15],
    "current": [12, 0.05],
    "voltage": [380, 0.4],
    "rpm": [1200, 4],
    "load": [40, 0.2],
    "noise": [50, 0.2],
}

previous_values = {}
rlu_days = {}  # realistic remaining life days


def smooth_value(prev, drift):
    """Small realistic slow drift - industrial machines NEVER jitter fast."""
    return round(prev + random.uniform(-drift, drift), 2)


def realistic_rlu(condition):
    """Healthy → months/years, Medium → weeks, Fail → hours/days."""
    if condition == "Healthy":
        return random.randint(200, 900)  # 6 months – 2.5 years
    if condition == "Medium":
        return random.randint(20, 80)  # weeks
    return random.randint(1, 10)  # days or hours


# ---------------------------------------------
# WEBSOCKET STREAM
# ---------------------------------------------
@app.websocket("/ws/data")
async def send_machine_data(ws: WebSocket):
    await ws.accept()

    global previous_values, rlu_days

    # Initialize sensors + RLU
    if not previous_values:
        for mid in MACHINE_NAMES:
            previous_values[mid] = {s: SENSORS[s][0] for s in SENSORS}
            rlu_days[mid] = realistic_rlu(FIXED_CONDITIONS[mid])

    while True:
        full_data = {}

        for mid, mname in MACHINE_NAMES.items():
            condition = FIXED_CONDITIONS[mid]

            # slow sensor drift
            for s, (base, drift) in SENSORS.items():
                previous_values[mid][s] = smooth_value(previous_values[mid][s], drift)

            sensor_data = previous_values[mid]

            # REALISTIC HEALTH BEHAVIOR
            if condition == "Healthy":
                health = random.randint(90, 99)
            elif condition == "Medium":
                health = random.randint(55, 75)
            else:
                health = random.randint(10, 35)

            failure = 100 - health

            # RLU decreases slowly
            rlu_days[mid] -= 0.01  # slow decrease
            if rlu_days[mid] < 1:
                rlu_days[mid] = 1

            full_data[mid] = {
                "name": mname,
                "condition": condition,
                "health": health,
                "failure": failure,
                "rlu": round(rlu_days[mid], 1),
                "sensor": sensor_data,
                "last_checked": (datetime.now() - timedelta(days=2)).strftime("%Y-%m-%d"),
                "next_service": (datetime.now() + timedelta(days=int(rlu_days[mid]))).strftime("%Y-%m-%d"),
            }

        await ws.send_text(json.dumps(full_data))
        await asyncio.sleep(2)  # slower updates realistic