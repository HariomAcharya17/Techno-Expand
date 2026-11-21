# TechnoExpand — Frontend (live demo)

IoT-based predictive maintenance dashboard: ML machine-failure detection and Remaining Useful Life (RUL) for 15 industrial assets.

This build runs fully in the browser. A simulator (`src/sim/`) produces the same live stream the
original FastAPI WebSocket backend (`../backend/main.py`) sent, so the site can be hosted as a static site.
The training dataset is not included: it is too large, and the Vercel free tier lagged when it was bundled.
See the in-app **Dataset & Model** page.

## Run locally

```bash
npm install
npm run dev
```

## Deploy on Vercel

1. Import the repository in Vercel.
2. Set **Root Directory** to `frontend`.
3. Framework preset: Vite (build `npm run build`, output `dist`).

`vercel.json` rewrites all routes to `index.html` so deep links such as `/machine/M6` work on refresh.
