# Telangana Rainfall Atlas

Interactive dashboard for Telangana Surface Water hourly rainfall telemetry.

The app visualizes pre-aggregated station, district, and time-series views from the source CSV covering May 2023–December 2025 across 38 stations and 22 districts.

## Features

- Filter by year, district, and station
- Monthly rainfall trend and year comparison charts
- District leaderboard and hour-of-day rainfall pattern
- Interactive station map (marker size ∝ cumulative rainfall)
- Clickable station table

## Data

| Path | Description |
| --- | --- |
| `data/rainfall_tel_hr_telangana_sw_ts_2021_2025.csv` | Original hourly telemetry CSV |
| `src/data/*.json` | Aggregated summary, districts, stations, monthly series used by the UI |
| `public/data/*.json` | Same aggregates served statically |

## Run locally

```bash
npm install
npm run dev
```

Open [http://127.0.0.1:4317](http://127.0.0.1:4317).

## Scripts

- `npm run dev` — Next.js dev server on port **4317**
- `npm run build` — production build
- `npm run start` — serve the production build on port **4317**
- `npm run lint` — ESLint

## Stack

Next.js, TypeScript, Tailwind CSS, Recharts.
