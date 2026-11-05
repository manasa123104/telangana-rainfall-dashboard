# Telangana Rainfall Atlas

Interactive dashboard for Telangana Surface Water hourly rainfall telemetry. Explore station, district, and time-series views built from ~72k readings across **38 stations** and **22 districts** (May 2023–December 2025).

## Live demo

Public tunnel (Cloudflare quick tunnel):  
**https://bracelets-grass-collectible-routing.trycloudflare.com**

This `*.trycloudflare.com` link only works while the cloud agent’s tunnel session is running. When that session stops, the URL will stop resolving — run the app locally (below) for a durable view.

## Features

- **Filters** — year, district, and station, with reset and scoped CSV export of the monthly series
- **Key stats** — scoped rainfall total, stations in view, southwest monsoon share (Jun–Sep), wettest station
- **Monsoon insight** — monsoon vs rest-of-year breakdown for the current filter scope
- **Charts** (each panel can download as PNG):
  - Monthly rainfall trend
  - Network daily rainfall (30 / 90 / 180-day windows)
  - Year comparison
  - District leaderboard
  - Hour-of-day rainfall pattern
  - Side-by-side district compare
- **Station map** — markers sized by cumulative rainfall; clickable station table

## Data

| Path | Description |
| --- | --- |
| `data/rainfall_tel_hr_telangana_sw_ts_2021_2025.csv` | Source hourly telemetry CSV |
| `src/data/*.json` | Pre-aggregated summary, districts, stations, and monthly series used by the UI |
| `public/data/*.json` | Same aggregates served as static assets |

## Run locally

```bash
npm install
npm run dev
```

Open [http://127.0.0.1:4317](http://127.0.0.1:4317).

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Next.js dev server on port **4317** |
| `npm run build` | Production build |
| `npm run start` | Serve the production build on port **4317** |
| `npm run lint` | ESLint |

## Stack

Next.js, TypeScript, Tailwind CSS, Recharts.
