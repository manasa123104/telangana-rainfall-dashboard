"use client";

import { useMemo, useState, useTransition } from "react";
import {
  CloudRain,
  Droplets,
  GitCompareArrows,
  MapPinned,
  RadioTower,
  Waves,
} from "lucide-react";
import { ChartPanel } from "@/components/chart-panel";
import {
  DailySparklineChart,
  DistrictBarChart,
  DistrictCompareChart,
  HourlyPatternChart,
  RainfallTrendChart,
  YearCompareChart,
  toMonthSeries,
} from "@/components/charts";
import { Filters } from "@/components/filters";
import { StationMap } from "@/components/station-map";
import { StatCard } from "@/components/stat-card";
import {
  downloadTextFile,
  monthlySeriesToCsv,
  recentDaily,
  splitMonsoon,
  topWetMonths,
} from "@/lib/analytics";
import {
  districts as allDistricts,
  stationMonthly,
  stations as allStations,
  summary,
  years,
} from "@/lib/data";
import { formatDateLabel, formatMonthLabel, formatNumber, formatRain } from "@/lib/format";
import type { MonthPoint } from "@/lib/types";

function filterMonths(points: MonthPoint[], year: string): MonthPoint[] {
  if (year === "all") return points;
  return points.filter((p) => p.month.startsWith(year));
}

function sumRain(points: MonthPoint[]): number {
  return points.reduce((acc, p) => acc + p.rainfall, 0);
}

function EmptyState({
  message,
  hint,
}: {
  message: string;
  hint?: string;
}) {
  return (
    <div className="empty-state" role="status">
      <p className="empty-state-title">{message}</p>
      {hint ? <p className="empty-state-hint">{hint}</p> : null}
    </div>
  );
}

export function Dashboard() {
  const [year, setYear] = useState("all");
  const [district, setDistrict] = useState("all");
  const [station, setStation] = useState("all");
  const [compareA, setCompareA] = useState("KARIMNAGAR");
  const [compareB, setCompareB] = useState("NALGONDA");
  const [dailyWindow, setDailyWindow] = useState<30 | 90 | 180>(90);
  const [showDaily, setShowDaily] = useState(true);
  const [, startTransition] = useTransition();

  const districtNames = useMemo(
    () => allDistricts.map((d) => d.name).sort(),
    [],
  );

  const stationsForDistrict = useMemo(() => {
    return allStations
      .filter((s) => (district === "all" ? true : s.district === district))
      .map((s) => ({ id: s.id, name: s.name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [district]);

  const filteredStations = useMemo(() => {
    return allStations
      .filter((s) => {
        if (district !== "all" && s.district !== district) return false;
        if (station !== "all" && s.id !== station) return false;
        return true;
      })
      .slice()
      .sort((a, b) => b.totalRainfall - a.totalRainfall);
  }, [district, station]);

  const scopedMonthly = useMemo(() => {
    let points: MonthPoint[] = [];
    if (station !== "all") {
      points = stationMonthly[station] ?? [];
    } else if (district !== "all") {
      points = allDistricts.find((d) => d.name === district)?.monthly ?? [];
    } else {
      points = summary.monthly;
    }
    return filterMonths(points, year);
  }, [district, station, year]);

  const trendSeries = useMemo(
    () => toMonthSeries(scopedMonthly),
    [scopedMonthly],
  );

  const districtBars = useMemo(() => {
    return allDistricts
      .map((d) => ({
        label: d.name.length > 14 ? `${d.name.slice(0, 13)}…` : d.name,
        fullLabel: d.name,
        rainfall: sumRain(filterMonths(d.monthly, year)),
      }))
      .filter((d) => d.rainfall > 0)
      .sort((a, b) => b.rainfall - a.rainfall)
      .slice(0, 12)
      .map(({ label, rainfall }) => ({ label, rainfall }));
  }, [year]);

  const yearBars = useMemo(() => {
    if (station !== "all") {
      const points = stationMonthly[station] ?? [];
      const byYear: Record<string, number> = {};
      for (const p of points) {
        const y = p.month.slice(0, 4);
        byYear[y] = (byYear[y] ?? 0) + p.rainfall;
      }
      return Object.entries(byYear)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([y, rainfall]) => ({ year: y, rainfall }));
    }
    if (district !== "all") {
      const d = allDistricts.find((x) => x.name === district);
      if (!d) return [];
      return Object.entries(d.byYear)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([y, rainfall]) => ({ year: y, rainfall }));
    }
    return Object.entries(summary.byYear)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([y, rainfall]) => ({ year: y, rainfall }));
  }, [district, station]);

  const hourly = useMemo(
    () =>
      summary.hourlyPattern.map((h) => ({
        label: `${String(h.hour).padStart(2, "0")}:00`,
        rainfall: h.avgRainfall,
      })),
    [],
  );

  const totalForView = useMemo(
    () => sumRain(scopedMonthly),
    [scopedMonthly],
  );

  const season = useMemo(
    () => splitMonsoon(scopedMonthly),
    [scopedMonthly],
  );

  const wetMonths = useMemo(
    () => topWetMonths(scopedMonthly, 5),
    [scopedMonthly],
  );

  const dailySeries = useMemo(() => {
    const points = recentDaily(summary.daily, dailyWindow);
    return points.map((p) => ({
      label: formatDateLabel(p.date),
      rainfall: p.rainfall,
    }));
  }, [dailyWindow]);

  const compareSeries = useMemo(() => {
    const a = allDistricts.find((d) => d.name === compareA);
    const b = allDistricts.find((d) => d.name === compareB);
    if (!a || !b) return [];

    const months = new Set<string>();
    for (const p of filterMonths(a.monthly, year)) months.add(p.month);
    for (const p of filterMonths(b.monthly, year)) months.add(p.month);

    const aMap = new Map(
      filterMonths(a.monthly, year).map((p) => [p.month, p.rainfall]),
    );
    const bMap = new Map(
      filterMonths(b.monthly, year).map((p) => [p.month, p.rainfall]),
    );

    return Array.from(months)
      .sort()
      .map((month) => ({
        label: formatMonthLabel(month),
        a: aMap.get(month) ?? 0,
        b: bMap.get(month) ?? 0,
      }));
  }, [compareA, compareB, year]);

  const topStation = filteredStations[0];
  const scopeLabel =
    station !== "all"
      ? allStations.find((s) => s.id === station)?.name ?? station
      : district !== "all"
        ? district
        : "Telangana SW network";

  function resetFilters() {
    startTransition(() => {
      setYear("all");
      setDistrict("all");
      setStation("all");
    });
  }

  function exportCsv() {
    if (!scopedMonthly.length) return;
    const slug = scopeLabel
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    const yearPart = year === "all" ? "all-years" : year;
    downloadTextFile(
      monthlySeriesToCsv(scopedMonthly, scopeLabel),
      `rainfall-${slug}-${yearPart}.csv`,
    );
  }

  return (
    <div className="dashboard">
      <a href="#main-charts" className="skip-link">
        Skip to charts
      </a>

      <header className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Telangana Surface Water · Telemetry</p>
          <h1>Rainfall Atlas</h1>
          <p className="lede">
            Explore hourly station rainfall across {summary.districts} districts
            from {summary.dateStart} to {summary.dateEnd}, drawn from{" "}
            {formatNumber(summary.records)} telemetry readings.
          </p>
        </div>
        <div className="hero-orb" aria-hidden />
      </header>

      <Filters
        years={years}
        districts={districtNames}
        stations={stationsForDistrict}
        year={year}
        district={district}
        station={station}
        scopeLabel={scopeLabel}
        onYearChange={(v) => startTransition(() => setYear(v))}
        onDistrictChange={(v) =>
          startTransition(() => {
            setDistrict(v);
            setStation("all");
          })
        }
        onStationChange={(v) => startTransition(() => setStation(v))}
        onReset={resetFilters}
        onExportCsv={exportCsv}
        canExportCsv={scopedMonthly.length > 0}
      />

      <section className="stats-grid" aria-label="Key figures">
        <StatCard
          label="Scoped rainfall"
          value={formatRain(totalForView)}
          hint={scopeLabel}
        />
        <StatCard
          label="Stations in view"
          value={String(filteredStations.length)}
          hint={`${summary.stations} in full network`}
        />
        <StatCard
          label="Monsoon share"
          value={
            scopedMonthly.length
              ? `${Math.round(season.monsoonShare * 100)}%`
              : "—"
          }
          hint={`Jun–Sep · ${formatRain(season.monsoon)}`}
        />
        <StatCard
          label="Wettest station"
          value={topStation ? formatRain(topStation.totalRainfall) : "—"}
          hint={topStation?.name ?? "No match"}
        />
      </section>

      <section className="insight-grid" aria-label="Season and wet months">
        <article className="insight-panel">
          <div className="panel-head">
            <div>
              <h2>Monsoon vs rest of year</h2>
              <p>
                Southwest monsoon (Jun–Sep) against all other months in the
                current scope.
              </p>
            </div>
            <Waves className="panel-icon" aria-hidden />
          </div>
          {scopedMonthly.length ? (
            <div className="season-bars" aria-hidden={false}>
              <div className="season-row">
                <div className="season-meta">
                  <span>Monsoon</span>
                  <strong>{formatRain(season.monsoon)}</strong>
                </div>
                <div className="season-track">
                  <div
                    className="season-fill season-fill-monsoon"
                    style={{
                      width: `${Math.max(4, season.monsoonShare * 100)}%`,
                    }}
                  />
                </div>
              </div>
              <div className="season-row">
                <div className="season-meta">
                  <span>Non-monsoon</span>
                  <strong>{formatRain(season.nonMonsoon)}</strong>
                </div>
                <div className="season-track">
                  <div
                    className="season-fill season-fill-dry"
                    style={{
                      width: `${Math.max(
                        4,
                        (1 - season.monsoonShare) * 100,
                      )}%`,
                    }}
                  />
                </div>
              </div>
              <p className="insight-note">
                {season.monsoonMonths} monsoon months ·{" "}
                {season.nonMonsoonMonths} other months in this filter.
              </p>
            </div>
          ) : (
            <EmptyState
              message="No seasonal totals for this filter set."
              hint="Widen the year or district filter to see monsoon share."
            />
          )}
        </article>

        <article className="insight-panel">
          <div className="panel-head">
            <div>
              <h2>Top wet months</h2>
              <p>Highest monthly totals inside the current scope.</p>
            </div>
            <CloudRain className="panel-icon" aria-hidden />
          </div>
          {wetMonths.length ? (
            <ol className="wet-list">
              {wetMonths.map((m, i) => (
                <li key={m.month}>
                  <span className="wet-rank">{i + 1}</span>
                  <span className="wet-label">{m.label}</span>
                  <span className="wet-value">{formatRain(m.rainfall)}</span>
                </li>
              ))}
            </ol>
          ) : (
            <EmptyState
              message="No wet months to rank."
              hint="Choose a broader year or leave station as All stations."
            />
          )}
        </article>
      </section>

      <section id="main-charts" className="panel-grid">
        <ChartPanel
          wide
          title="Monthly rainfall trend"
          description="Cumulative mm by month for the current scope."
          filename="rainfall-monthly-trend.png"
          exportLabels={`${scopeLabel} · ${year === "all" ? "All years" : year} · X: Month · Y: Rainfall (mm)`}
          icon={<CloudRain className="panel-icon" aria-hidden />}
          canDownload={trendSeries.length > 0}
        >
          <div className="chart-frame chart-tall">
            {trendSeries.length ? (
              <RainfallTrendChart data={trendSeries} />
            ) : (
              <EmptyState
                message="No monthly readings for this filter set."
                hint="Try All years or another district."
              />
            )}
          </div>
        </ChartPanel>

        <ChartPanel
          wide
          title="Network daily rainfall"
          description={`Statewide daily totals for the last ${dailyWindow} days of the telemetry window.`}
          filename={`rainfall-daily-${dailyWindow}d.png`}
          exportLabels={`Telangana SW network · Dataset ending ${summary.dateEnd} · X: Date · Y: Rainfall (mm)`}
          canDownload={showDaily && dailySeries.length > 0}
          actions={
            <>
              <div className="segmented" role="group" aria-label="Daily window">
                {([30, 90, 180] as const).map((n) => (
                  <button
                    key={n}
                    type="button"
                    className={
                      dailyWindow === n
                        ? "segmented-btn is-active"
                        : "segmented-btn"
                    }
                    onClick={() => startTransition(() => setDailyWindow(n))}
                    aria-pressed={dailyWindow === n}
                  >
                    {n}d
                  </button>
                ))}
              </div>
              <button
                type="button"
                className="filter-btn filter-btn-ghost"
                onClick={() => setShowDaily((v) => !v)}
                aria-pressed={showDaily}
              >
                {showDaily ? "Hide" : "Show"}
              </button>
            </>
          }
        >
          <div className="chart-frame">
            {!showDaily ? (
              <EmptyState
                message="Daily sparkline hidden."
                hint="Turn it back on to scan recent statewide pulses."
              />
            ) : dailySeries.length ? (
              <DailySparklineChart data={dailySeries} />
            ) : (
              <EmptyState message="No daily readings in this window." />
            )}
          </div>
        </ChartPanel>

        <ChartPanel
          title="Year comparison"
          description="Total rainfall by calendar year."
          filename="rainfall-year-comparison.png"
          exportLabels={`${scopeLabel} · All years · X: Year · Y: Rainfall (mm)`}
          icon={<Droplets className="panel-icon" aria-hidden />}
          canDownload={yearBars.length > 0}
        >
          <div className="chart-frame">
            {yearBars.length ? (
              <YearCompareChart data={yearBars} />
            ) : (
              <EmptyState message="No yearly totals available." />
            )}
          </div>
        </ChartPanel>

        <ChartPanel
          title="Hour-of-day pattern"
          description="Average hourly rainfall across all readings."
          filename="rainfall-hour-of-day.png"
          exportLabels="Telangana SW network · All years · X: Hour of day · Y: Average rainfall (mm)"
          icon={<RadioTower className="panel-icon" aria-hidden />}
          canDownload={hourly.length > 0}
        >
          <div className="chart-frame">
            {hourly.length ? (
              <HourlyPatternChart data={hourly} />
            ) : (
              <EmptyState message="No hourly pattern available." />
            )}
          </div>
        </ChartPanel>

        <ChartPanel
          wide
          title="District totals"
          description={`Top districts by cumulative rainfall${year !== "all" ? ` in ${year}` : ""}.`}
          filename="rainfall-district-totals.png"
          exportLabels={`${year === "all" ? "All years" : year} · X: Rainfall (mm) · Y: District`}
          canDownload={districtBars.length > 0}
        >
          <div className="chart-frame chart-tall">
            {districtBars.length ? (
              <DistrictBarChart data={districtBars} />
            ) : (
              <EmptyState message="No district totals for this year." />
            )}
          </div>
        </ChartPanel>

        <ChartPanel
          wide
          title="Compare districts"
          description={`Side-by-side monthly rainfall for two districts${year !== "all" ? ` in ${year}` : ""}.`}
          filename={`rainfall-compare-${compareA}-${compareB}.png`}
          exportLabels={`Teal: ${compareA} · Gold: ${compareB} · ${year === "all" ? "All years" : year} · X: Month · Y: Rainfall (mm)`}
          icon={<GitCompareArrows className="panel-icon" aria-hidden />}
          canDownload={compareSeries.length > 0 && compareA !== compareB}
          toolbar={
            <div className="compare-controls">
              <label className="filter-field" htmlFor="compare-a">
                <span id="compare-a-label">District A</span>
                <select
                  id="compare-a"
                  value={compareA}
                  onChange={(e) =>
                    startTransition(() => setCompareA(e.target.value))
                  }
                  aria-labelledby="compare-a-label"
                >
                  {districtNames.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </label>
              <label className="filter-field" htmlFor="compare-b">
                <span id="compare-b-label">District B</span>
                <select
                  id="compare-b"
                  value={compareB}
                  onChange={(e) =>
                    startTransition(() => setCompareB(e.target.value))
                  }
                  aria-labelledby="compare-b-label"
                >
                  {districtNames.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          }
        >
          <div className="chart-frame chart-tall">
            {compareA === compareB ? (
              <EmptyState
                message="Pick two different districts to compare."
                hint="District A and District B must not match."
              />
            ) : compareSeries.length ? (
              <DistrictCompareChart
                data={compareSeries}
                nameA={compareA}
                nameB={compareB}
              />
            ) : (
              <EmptyState message="No overlapping months for these districts." />
            )}
          </div>
        </ChartPanel>

        <ChartPanel
          wide
          title="Station map"
          description="Click a marker to focus that station."
          filename="rainfall-station-map.png"
          exportLabels={`${scopeLabel} · All-time totals · Circle size: Cumulative rainfall (mm) · Position: Longitude / Latitude`}
          icon={<MapPinned className="panel-icon" aria-hidden />}
          canDownload={filteredStations.length > 0}
        >
          <div className="chart-frame chart-map">
            <StationMap
              stations={filteredStations}
              selected={station === "all" ? undefined : station}
              onSelect={(id) =>
                startTransition(() => {
                  const match = allStations.find((s) => s.id === id);
                  if (match) {
                    setDistrict(match.district);
                    setStation(match.id);
                  }
                })
              }
            />
          </div>
        </ChartPanel>

        <article className="panel panel-wide">
          <div className="panel-head">
            <div>
              <h2>Station leaderboard</h2>
              <p>Highest cumulative rainfall in the current district filter.</p>
            </div>
          </div>
          <div className="table-wrap">
            {filteredStations.length ? (
              <table>
                <thead>
                  <tr>
                    <th scope="col">#</th>
                    <th scope="col">Station</th>
                    <th scope="col">District</th>
                    <th scope="col">Lat</th>
                    <th scope="col">Lon</th>
                    <th scope="col">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStations.slice(0, 12).map((s, i) => (
                    <tr
                      key={s.id}
                      className={station === s.id ? "is-active" : undefined}
                      onClick={() =>
                        startTransition(() => {
                          setDistrict(s.district);
                          setStation(s.id);
                        })
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          startTransition(() => {
                            setDistrict(s.district);
                            setStation(s.id);
                          });
                        }
                      }}
                      tabIndex={0}
                      role="button"
                      aria-label={`Focus station ${s.name}`}
                    >
                      <td>{i + 1}</td>
                      <td>{s.name}</td>
                      <td>{s.district}</td>
                      <td>{s.lat.toFixed(3)}</td>
                      <td>{s.lon.toFixed(3)}</td>
                      <td>{formatRain(s.totalRainfall)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <EmptyState
                message="No stations match these filters."
                hint="Reset filters or choose another district."
              />
            )}
          </div>
        </article>
      </section>

      <footer className="footer">
        <p>
          Source: {summary.source} · Agency: {summary.agency}. Values are
          summed telemetry readings (mm) and may include cumulative sensor
          quirks in the raw feed.
        </p>
      </footer>
    </div>
  );
}
