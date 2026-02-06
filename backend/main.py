from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import json
import random
import joblib
import numpy as np
import os
from datetime import datetime, timedelta, date

# ==========================================
# FASTAPI APP
# ==========================================
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================
# MODEL (optional but used)
# ==========================================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
model = joblib.load(os.path.join(BASE_DIR, "python/model.pkl"))
scaler = joblib.load(os.path.join(BASE_DIR, "python/scaler.pkl"))

# ==========================================
# MACHINE LIST
# ==========================================
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

# ==========================================
# FIXED CONDITIONS
# ==========================================
FIXED_CONDITIONS = {
    "M1": "Healthy", "M2": "Healthy", "M3": "Medium",
    "M4": "Fail", "M5": "Healthy", "M6": "Fail",
    "M7": "Healthy", "M8": "Fail", "M9": "Healthy",
    "M10": "Fail", "M11": "Healthy", "M12": "Healthy",
    "M13": "Healthy", "M14": "Healthy", "M15": "Fail",
}

# ==========================================
# PROFESSIONAL ENGINEERS + REAL NOTES
# ==========================================
ENGINEERS = [
    "Jacob Keller", "Rina Shah", "Michael Torres",
    "Sara Menon", "David Park", "Arjun Iyer", "Elena Petrova"
]

EVENT_TYPES = [
    "Bearing Replacement", "Motor Alignment Correction",
    "Thermal Shock Test", "Cooling System Overhaul",
    "Valve Calibration", "Vibration Diagnostics",
    "Full Preventive Maintenance"
]

NOTES_HEALTHY = [
    "All readings normal.",
    "Routine check completed.",
    "System running at optimal efficiency."
]

NOTES_MEDIUM = [
    "Minor anomaly detected.",
    "Component wear detected, advising monitoring.",
    "Slight misalignment corrected."
]

NOTES_FAIL = [
    "Critical overheating detected.",
    "High vibration — unsafe for operation.",
    "Severe pressure fluctuation, immediate service required."
]

# ==========================================
# MAINTENANCE HISTORY GENERATION
# ==========================================
MAINTENANCE_HISTORY = {}

def generate_history(condition):
    history = []
    today = date.today()

    last_date = today - timedelta(days=random.randint(10, 40))

    for _ in range(random.randint(4, 7)):
        event = random.choice(EVENT_TYPES)

        if condition == "Healthy":
            note = random.choice(NOTES_HEALTHY)
        elif condition == "Medium":
            note = random.choice(NOTES_MEDIUM)
        else:
            note = random.choice(NOTES_FAIL)

        history.append({
            "date": str(last_date),
            "event": event,
            "engineer": random.choice(ENGINEERS),
            "notes": note
        })

        last_date -= timedelta(days=random.randint(40, 120))

    history.sort(key=lambda x: x["date"], reverse=True)
    return history

for mid in MACHINE_NAMES:
    MAINTENANCE_HISTORY[mid] = generate_history(FIXED_CONDITIONS[mid])

# ==========================================
# SENSOR MODEL — REAL INDUSTRIAL RANGES
# ==========================================
SENSORS = {
    "temperature": {
        "Healthy": (35, 45), "Medium": (50, 70), "Fail": (70, 110)
    },
    "pressure": {
        "Healthy": (1.0, 2.0), "Medium": (2.0, 3.8), "Fail": (3.8, 6.8)
    },
    "vibration": {
        "Healthy": (2, 6), "Medium": (7, 15), "Fail": (15, 45)
    },
    "humidity": {
        "Healthy": (40, 60), "Medium": (50, 75), "Fail": (60, 95)
    },
    "current": {
        "Healthy": (8, 14), "Medium": (14, 22), "Fail": (22, 40)
    },
    "voltage": {
        "Healthy": (365, 395), "Medium": (340, 420), "Fail": (300, 480)
    },
    "rpm": {
        "Healthy": (1100, 1300), "Medium": (900, 1600), "Fail": (200, 2000)
    },
    "load": {
        "Healthy": (20, 60), "Medium": (40, 90), "Fail": (80, 130)
    },
    "noise": {
        "Healthy": (40, 60), "Medium": (60, 90), "Fail": (90, 140)
    },
}

def generate_sensor(condition, key):
    low, high = SENSORS[key][condition]
    base = random.uniform(low, high)

    if condition == "Healthy":
        noise = random.uniform(-1, 1)
    elif condition == "Medium":
        noise = random.uniform(-3, 3)
    else:
        noise = random.uniform(-10, 10)

    return round(base + noise, 2)

# ==========================================
# STATE VARS
# ==========================================
rlu_days = {}
working_hours = {}

def realistic_rul(condition):
    if condition == "Healthy":
        return random.randint(300, 900)
    if condition == "Medium":
        return random.randint(50, 150)
    return random.randint(1, 20)

# ==========================================
# WEBSOCKET STREAM
# ==========================================
@app.websocket("/ws/data")
async def ws_data(ws: WebSocket):
    await ws.accept()

    global rlu_days, working_hours

    if not rlu_days:
        for mid in MACHINE_NAMES:
            condition = FIXED_CONDITIONS[mid]
            rlu_days[mid] = realistic_rul(condition)

            if condition == "Healthy":
                working_hours[mid] = random.randint(2000, 8000)
            elif condition == "Medium":
                working_hours[mid] = random.randint(8000, 15000)
            else:
                working_hours[mid] = random.randint(15000, 45000)

    while True:
        full_data = {}

        for mid, name in MACHINE_NAMES.items():
            condition = FIXED_CONDITIONS[mid]

            # Generate sensors
            sensor_data = {
                k: generate_sensor(condition, k) for k in SENSORS
            }

            # Health %
            if condition == "Healthy":
                health = random.randint(92, 99)
            elif condition == "Medium":
                health = random.randint(55, 75)
            else:
                health = random.randint(5, 30)

            failure = 100 - health

            # RUL degrade
            rlu_days[mid] -= 0.02
            if rlu_days[mid] < 1:
                rlu_days[mid] = 1

            # Working hours
            working_hours[mid] += 0.02

            last_checked = MAINTENANCE_HISTORY[mid][0]["date"]
            next_service = str(
                date.fromisoformat(last_checked) +
                timedelta(days=int(rlu_days[mid]))
            )

            full_data[mid] = {
                "name": name,
                "condition": condition,
                "health": health,
                "failure": failure,
                "sensor": sensor_data,
                "workingHours": round(working_hours[mid], 2),
                "rlu": round(rlu_days[mid], 1),
                "last_checked": last_checked,
                "next_service": next_service,
                "maintenanceHistory": MAINTENANCE_HISTORY[mid],
            }

        await ws.send_text(json.dumps(full_data))
        await asyncio.sleep(2)