<div align="center">

# ⚙️ TechnoExpand — Industrial Predictive Maintenance Platform

**Real-time machine health monitoring & AI-powered failure prediction for industrial environments**

[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)

</div>

---

## 📋 Table of Contents

- [About the Project](#-about-the-project)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Screenshots](#-screenshots)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Machine Learning Model](#-machine-learning-model)
- [WebSocket Data Flow](#-websocket-data-flow)
- [Team](#-team)
- [Future Roadmap](#-future-roadmap)
- [License](#-license)

---

## 🔍 About the Project

**TechnoExpand** is a full-stack industrial predictive maintenance platform that monitors **15 industrial machines** in real-time using simulated IoT sensor data. It combines **WebSocket-based live streaming**, **Machine Learning predictions**, and a **modern React dashboard** to provide actionable insights about machine health, failure probability, and remaining useful life (RUL).

The platform is designed to replicate production-level monitoring workflows used in manufacturing, power plants, and industrial automation environments.

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 📊 **Real-Time Dashboard** | Live pie charts and line graphs showing overall machine fleet health |
| 🏭 **15 Industrial Machines** | CNC Mills, Compressors, Pumps, Boilers, Robot Arms, Turbines & more |
| 🔄 **Live WebSocket Streaming** | 9 sensor metrics streamed every 2 seconds via WebSocket |
| 🤖 **ML Failure Prediction** | Pre-trained model (Random Forest) predicts machine condition: Healthy / Medium / Fail |
| 📈 **9 Sensor Metrics** | Temperature, Pressure, Vibration, Humidity, Current, Voltage, RPM, Load, Noise |
| ⏱️ **RUL Estimation** | Remaining Useful Life countdown in days for each machine |
| 📅 **Maintenance Timeline** | Visual timeline of past maintenance events with engineer notes |
| 📥 **Excel Export** | One-click export of machine data & sensor history to `.xlsx` |
| 🔐 **Authentication** | Login/Signup with localStorage-based session management |
| 🎨 **Animated UI** | Smooth Framer Motion page transitions and micro-interactions |
| 📱 **Responsive Layout** | Sidebar navigation + top navbar with glassmorphism styling |

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **React 19** | UI library |
| **Vite 7** | Build tool & dev server |
| **Tailwind CSS 4** | Utility-first styling |
| **Framer Motion** | Animations & page transitions |
| **Chart.js + react-chartjs-2** | Pie charts & line graphs |
| **React Router DOM 7** | Client-side routing |
| **Lottie React** | Animated illustrations (Login/Signup) |
| **SheetJS (xlsx)** | Excel file generation |
| **file-saver** | Client-side file downloads |
| **react-icons** | Icon library |

### Backend
| Technology | Purpose |
|---|---|
| **FastAPI** | Python web framework |
| **WebSocket** | Real-time bidirectional data streaming |
| **scikit-learn (joblib)** | ML model loading & inference |
| **NumPy** | Numerical computations |
| **Uvicorn** | ASGI server |

### ML / Data Science
| Technology | Purpose |
|---|---|
| **Random Forest Classifier** | Pre-trained condition prediction model |
| **StandardScaler** | Feature normalization (saved as `scaler.pkl`) |
| **joblib** | Model serialization |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                             │
│  React 19 + Vite + Tailwind CSS + Framer Motion             │
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌───────────────┐             │
│  │Dashboard │  │ Machines │  │MachineDetails │             │
│  │(Charts)  │  │ (Grid)   │  │(Deep Dive)    │             │
│  └────┬─────┘  └────┬─────┘  └──────┬────────┘             │
│       └──────────────┴───────────────┘                      │
│                      │ WebSocket                            │
└──────────────────────┼──────────────────────────────────────┘
                       │ ws://localhost:8000/ws/data
┌──────────────────────┼──────────────────────────────────────┐
│                  BACKEND (FastAPI)                           │
│                      │                                      │
│  ┌───────────────────▼──────────────────────┐               │
│  │        WebSocket Handler                 │               │
│  │  • Generates sensor data per condition   │               │
│  │  • Streams 15 machines every 2s          │               │
│  │  • Calculates RUL, health %, failure %   │               │
│  └───────────────────┬──────────────────────┘               │
│                      │                                      │
│  ┌───────────────────▼──────────────────────┐               │
│  │   ML Model (model.pkl + scaler.pkl)      │               │
│  │   Random Forest → Healthy/Medium/Fail    │               │
│  └──────────────────────────────────────────┘               │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **Python** ≥ 3.10
- **pip** (Python package manager)

### 1. Clone the Repository

```bash
git clone https://github.com/HariomAcharya17/Techno-Expand.git
cd Techno-Expand
```

### 2. Backend Setup

```bash
cd backend

# Install Python dependencies
pip install fastapi uvicorn joblib numpy scikit-learn websockets

# Start the backend server
uvicorn main:app --reload --port 8000
```

The WebSocket server will be available at `ws://localhost:8000/ws/data`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will open at `http://localhost:5173`

### 4. Access the Application

1. Open `http://localhost:5173` in your browser
2. **Sign up** with a new account (stored in localStorage)
3. **Log in** with your credentials
4. Explore the **Dashboard**, **Machines**, and individual machine detail pages

---

## 📁 Project Structure

```
Techno-Expand/
├── backend/
│   ├── main.py                    # FastAPI app with WebSocket handler
│   ├── package.json               # Node.js deps (Express, WS — legacy)
│   └── python/
│       ├── model.pkl              # Pre-trained Random Forest model
│       ├── scaler.pkl             # StandardScaler for feature normalization
│       └── predict.py             # Standalone prediction script
│
├── frontend/
│   ├── public/
│   │   ├── machines/              # Machine images (M1.jpg – M15.jpg)
│   │   └── team/                  # Team member photos
│   ├── src/
│   │   ├── assets/
│   │   │   ├── Login.json         # Lottie animation for login page
│   │   │   └── Chart.json         # Lottie animation for charts
│   │   ├── components/
│   │   │   ├── Sidebar.jsx        # Fixed sidebar navigation
│   │   │   ├── Navbar.jsx         # Top navigation bar
│   │   │   ├── BackButton.jsx     # Reusable back button
│   │   │   └── ProtectedRoute.jsx # Auth guard for protected pages
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx      # Main dashboard with stats & charts
│   │   │   ├── Machines.jsx       # Machine grid with live status cards
│   │   │   ├── MachineDetails.jsx # Deep dive: sensors, history, export
│   │   │   ├── Predict.jsx        # Manual ML prediction form
│   │   │   ├── Login.jsx          # Login page with Lottie animation
│   │   │   ├── Signup.jsx         # Registration page
│   │   │   ├── MyAccount.jsx      # User profile page
│   │   │   ├── OurMission.jsx     # Project mission & vision
│   │   │   ├── OurApproach.jsx    # Technical approach timeline
│   │   │   ├── FutureUses.jsx     # Future roadmap
│   │   │   └── OurTeam.jsx        # Team member profiles
│   │   ├── App.jsx                # Root component with routing
│   │   ├── App.css                # Global styles
│   │   ├── main.jsx               # React entry point
│   │   └── index.css              # Tailwind imports
│   ├── index.html                 # HTML entry point
│   ├── vite.config.js             # Vite + React + Tailwind config
│   └── package.json               # Frontend dependencies
│
└── package.json                   # Root-level Supabase dependency
```

---

## 🤖 Machine Learning Model

### Model Details

| Property | Value |
|---|---|
| **Algorithm** | Random Forest Classifier |
| **Input Features** | 9 sensor metrics (temperature, pressure, vibration, humidity, current, voltage, RPM, load, noise) |
| **Output Classes** | `0` = Healthy, `1` = Medium, `2` = Fail |
| **Preprocessing** | StandardScaler normalization |
| **Serialization** | joblib (`.pkl` files) |

### Prediction Flow

```
User Input (9 metrics) → StandardScaler → Random Forest → Condition Class
                                                          ├── Healthy (80-100% health)
                                                          ├── Medium  (40-75% health)
                                                          └── Fail    (0-30% health)
```

---

## 🔄 WebSocket Data Flow

The backend streams data for all 15 machines every **2 seconds** via a single WebSocket connection:

```json
{
  "M1": {
    "name": "CNC Milling Machine",
    "condition": "Healthy",
    "health": 95,
    "failure": 5,
    "sensor": {
      "temperature": 42.3,
      "pressure": 1.5,
      "vibration": 4.2,
      "humidity": 52.1,
      "current": 11.8,
      "voltage": 382.5,
      "rpm": 1200,
      "load": 45.3,
      "noise": 55.2
    },
    "workingHours": 5432.1,
    "rlu": 650.2,
    "last_checked": "2026-08-15",
    "next_service": "2028-05-27",
    "maintenanceHistory": [...]
  }
}
```

### Monitored Machines

| ID | Machine | Condition |
|---|---|---|
| M1 | CNC Milling Machine | 🟢 Healthy |
| M2 | Air Compressor | 🟢 Healthy |
| M3 | Centrifugal Pump | 🟡 Medium |
| M4 | Injection Molding Machine | 🟢 Healthy |
| M5 | Industrial Boiler | 🟢 Healthy |
| M6 | Conveyor System | 🔴 Fail |
| M7 | Hydraulic Press | 🟢 Healthy |
| M8 | Cooling Tower | 🔴 Fail |
| M9 | Industrial Robot Arm | 🟢 Healthy |
| M10 | Steam Turbine | 🔴 Fail |
| M11 | Electric Motor | 🟢 Healthy |
| M12 | Heat Exchanger | 🟢 Healthy |
| M13 | Reciprocating Pump | 🟢 Healthy |
| M14 | Industrial Chiller | 🟢 Healthy |
| M15 | Rotary Kiln | 🔴 Fail |

---

## 👥 Team

| Name | Role |
|---|---|
| **Hariom Acharya** | Full Stack Developer & Hardware Engineer |
| **Kaushik Dalvi** | UI/UX Designer & Hardware Support |
| **Divya Balchandani** | Machine Learning Engineer |
| **Vraj Bagadiya** | UI Helper & Resource Management |

> 🏫 **Group 47** — LDRP-ITR

---

## 🔮 Future Roadmap

- ⚡ **Smart Energy Management** — Predict machine load & reduce power waste
- 🤖 **Autonomous Maintenance** — ML bots auto-schedule maintenance
- ☁️ **Cloud Integration** — Push live data to AWS / Azure / Google Cloud
- 📡 **ESP32 Hardware Integration** — Real sensor data from IoT devices
- 🔮 **Full Predictive Factory** — Zero-downtime industry with AI-driven insights

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">

**Built with ❤️ by Team TechnoExpand**

⭐ Star this repo if you found it useful!

</div>
