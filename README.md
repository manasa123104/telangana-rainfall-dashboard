# Telangana Rainfall Atlas

An interactive dashboard for Telangana Surface Water rainfall telemetry. Explore **72,223 readings** across **38 stations** and **22 districts**, covering **30 May 2023–31 December 2025**.

## Public dashboard

Open [Telangana Rainfall Atlas](https://manasa123104.github.io/telangana-rainfall-dashboard/) to use the charts, filters, and downloads without installing anything.

## About the project

Telangana Rainfall Atlas turns a large collection of hourly rainfall readings into an interactive visual overview. Instead of inspecting thousands of CSV rows, users can explore rainfall over time, compare districts, focus on individual monitoring stations, and save charts for reports or presentations.

The project is intended for students, researchers, and anyone exploring the supplied Telangana rainfall dataset. It helps answer questions such as:

- Which months have the highest recorded rainfall totals?
- How much of the selected rainfall total occurs during the southwest monsoon?
- How do annual totals vary for a particular station or district?
- How do two districts compare month by month?
- Where are the monitoring stations, and how do their recorded totals differ?

This is a historical data exploration project. It does not provide live weather updates, rainfall predictions, or flood alerts.

## How it works

1. **Source data:** the repository includes an hourly telemetry CSV from Telangana SW.
2. **Prepared aggregates:** JSON files contain network summaries, district totals, station details, and monthly readings for each station.
3. **Dashboard calculations:** the browser filters those aggregates and calculates the selected monthly total, monsoon share, wet-month rankings, and district comparisons.
4. **Visualization:** React components render charts using Recharts and a station map using SVG. Chart dimensions adjust to the available screen width.
5. **Export:** the current chart can be saved as a labeled PNG, while the selected monthly series can be downloaded as CSV.

The Next.js home page loads the dashboard, and interactions run in the browser. The current application uses bundled data rather than a database or an external weather API; no API key or account is required.

### Understanding the figures

- **Scoped rainfall** is the sum of monthly rainfall values matching the selected year, district, and station.
- **Stations in view** counts stations matching the district and station selections; it does not indicate how many stations reported data in the selected year.
- **Monsoon share** is the June–September rainfall total divided by the total for the selected monthly series, expressed as a percentage.
- **Top wet months** ranks the five highest monthly totals within the selected scope.
- **Wettest station** ranks matching stations by their all-time recorded totals, even when a single year is selected.

Network and district totals combine station readings. They should not be interpreted as an area-weighted rainfall depth for the whole state or district. Station coverage, missing observations, and cumulative sensor readings can affect comparisons. The station map shows relative geographic positions and is not a district-boundary map.

## Run locally

Install Node.js **20.9 or newer** and npm, then run:

```bash
git clone https://github.com/manasa123104/telangana-rainfall-dashboard.git
cd telangana-rainfall-dashboard
npm ci
npm run dev
```

Open [http://localhost:4317](http://localhost:4317). Keep the server running while using the dashboard.

For a production build:

```bash
npm run build
npm run start
```

The production server also uses port **4317**. Stop the development server before starting it.

## Explore the dashboard

- Select a **year**, **district**, or **station** to explore the data. Choose the **All** options for the full network view, or use **Reset**.
- Review scoped rainfall, station counts, monsoon share, seasonal totals, and the wettest months.
- Click a station map marker or leaderboard row to focus on that station.
- View charts on desktop or mobile. Panels fit the available width, and wide station tables scroll horizontally.

### Charts and filter scope

- **Monthly rainfall trend:** follows the year, district, and station filters.
- **Network daily rainfall:** statewide totals for the last **30, 90, or 180 days** of the dataset. Use **Hide / Show** to toggle this chart. It is independent of the main filters.
- **Year comparison:** compares all available years for the selected district or station; the year filter does not restrict this comparison.
- **Hour-of-day pattern:** average hourly rainfall across the full dataset, independent of the main filters.
- **District totals:** the top 12 districts for the selected year, or all years. District and station filters do not restrict this ranking.
- **Compare districts:** monthly rainfall for two independently selected districts, using the selected year. Choose two different districts.
- **Station map:** stations matching the district and station filters, with markers sized by all-time cumulative rainfall.

The station leaderboard and wettest-station figure also use all-time station totals. Filter combinations without readings show an explanatory empty state.

### Example workflow

1. Start with **All years**, **All districts**, and **All stations** to see the complete dataset.
2. Select a year to inspect its monthly trend and district ranking.
3. Select a district, then a station, to narrow the monthly and seasonal summaries. Changing the district resets the station selection.
4. Choose two different districts in **Compare districts** to examine their monthly patterns for the selected year.
5. Download a chart image or export the filtered monthly CSV, then use **Reset** to return to the full network view.

## Download charts and data

- Click **Download** on any of the six chart panels or the station map to save a **PNG** image of the current view. On mobile, the button appears as a download icon.
- Saved images include the chart title, description, relevant filter scope, and axis names and units. District comparisons also identify the teal and gold series by district name.
- Use **Export CSV** beside the filters to save monthly rainfall for the selected year, district, and station. The file includes `scope`, `month`, and `rainfall_mm` columns.
- Chart downloads are unavailable when there is no data, the daily chart is hidden, or both comparison selections are the same district.

## Data

- `data/rainfall_tel_hr_telangana_sw_ts_2021_2025.csv` — source hourly telemetry from Telangana SW.
- `src/data/*.json` — pre-aggregated summary, district, station, and monthly data imported by the dashboard.
- `public/data/*.json` — aggregate files available as static assets.

The dashboard reads the pre-aggregated JSON files; it does not process the source CSV at runtime. Updating the CSV alone will not update the charts.

Rainfall values are summed telemetry readings in millimetres and may include cumulative sensor quirks in the source feed. Daily windows end at the last date in the dataset, not today's date.

## Project structure

```text
data/                         Source telemetry CSV
public/data/                  Public copies of aggregate JSON files
src/
  app/
    page.tsx                  Dashboard entry page
    layout.tsx                Shared page layout
    globals.css               Dashboard styling and responsive layout
  components/
    dashboard.tsx             Filter state, calculations, and page sections
    filters.tsx               Year, district, and station controls
    charts.tsx                Six rainfall chart components
    chart-panel.tsx           Chart container and download controls
    station-map.tsx           SVG station map
    stat-card.tsx             Summary statistic cards
  data/                       Aggregate JSON imported by the app
  lib/
    data.ts                   Exposes the imported datasets
    types.ts                  Dataset type definitions
    analytics.ts              Seasonal totals, rankings, and CSV export
    format.ts                 Number and date formatting
    use-element-size.ts       Responsive chart measurements
    download-chart.ts         PNG capture and export labels
```

## Development checks

```bash
npm run lint
npx tsc --noEmit
npm run build
```

When changing charts, also check the All options, individual filters, daily windows, district comparison, PNG downloads, and narrow-screen layout in the browser.

## Stack

Next.js, React, TypeScript, Tailwind CSS, Recharts, Lucide icons, and html-to-image for PNG exports.

Next.js provides the application framework, React manages interactive views, and TypeScript describes the data structures. Recharts draws the rainfall graphs, CSS and Tailwind support the layout, and html-to-image captures chart content for download. PNG export also has an SVG fallback and adds readable labels using a canvas.

## Hosting

The public dashboard is hosted on GitHub Pages from the `gh-pages` branch. The localhost address works only on the computer running the development server.

To rebuild the static website in PowerShell:

```powershell
$env:GITHUB_PAGES = "true"
npm run build
Remove-Item Env:GITHUB_PAGES
```

Publish the contents of `out/` with a `.nojekyll` file to the root of `gh-pages`. The export uses `/telangana-rainfall-dashboard` as its base path. Updates to `main` require rebuilding and republishing `gh-pages`; they are not deployed automatically. Normal local builds continue to support `npm run start`.
