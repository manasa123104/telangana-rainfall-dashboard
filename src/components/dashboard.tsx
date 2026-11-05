"use client";

import { useMemo, useState, useTransition } from "react";
import { CloudRain, Droplets, MapPinned, RadioTower } from "lucide-react";
import { ChartPanel } from "@/components/chart-panel";
import {
  DistrictBarChart,
  HourlyPatternChart,
  RainfallTrendChart,
  YearCompareChart,
  toMonthSeries,
} from "@/components/charts";
import { Filters } from "@/components/filters";
import { StationMap } from "@/components/station-map";
import { StatCard } from "@/components/stat-card";
import {
  districts as allDistricts,
  stationMonthly,
  stations as allStations,
  summary,
  years,
} from "@/lib/data";
import { formatNumber, formatRain } from "@/lib/format";
import type { MonthPoint } from "@/lib/types";

function filterMonths(points: MonthPoint[], year: string): MonthPoint[] {
  if (year === "all") return points;
  return points.filter((p) => p.month.startsWith(year));
}

function sumRain(points: MonthPoint[]): number {
  return points.reduce((acc, p) => acc + p.rainfall, 0);
}

export function Dashboard() {
  const [year, setYear] = useState("all");
  const [district, setDistrict] = useState("all");
  const [station, setStation] = useState("all");
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

  const trendSeries = useMemo(() => {
    let points: MonthPoint[] = [];
    if (station !== "all") {
      points = stationMonthly[station] ?? [];
    } else if (district !== "all") {
      points = allDistricts.find((d) => d.name === district)?.monthly ?? [];
    } else {
      points = summary.monthly;
    }
    return toMonthSeries(filterMonths(points, year));
  }, [district, station, year]);

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

  const totalForView = useMemo(() => {
    if (station !== "all") {
      return sumRain(filterMonths(stationMonthly[station] ?? [], year));
    }
    if (district !== "all") {
      const d = allDistricts.find((x) => x.name === district);
      return sumRain(filterMonths(d?.monthly ?? [], year));
    }
    return sumRain(filterMonths(summary.monthly, year));
  }, [district, station, year]);

  const topStation = filteredStations[0];
  const scopeLabel =
    station !== "all"
      ? allStations.find((s) => s.id === station)?.name ?? station
      : district !== "all"
        ? district
        : "Telangana SW network";

  return (
    <div className="dashboard">
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
        onYearChange={(v) => startTransition(() => setYear(v))}
        onDistrictChange={(v) =>
          startTransition(() => {
            setDistrict(v);
            setStation("all");
          })
        }
        onStationChange={(v) => startTransition(() => setStation(v))}
      />

      <section className="stats-grid">
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
          label="Telemetry records"
          value={formatNumber(summary.records)}
          hint={`${formatNumber(summary.nonzeroRecords)} with rain > 0`}
        />
        <StatCard
          label="Wettest station"
          value={topStation ? formatRain(topStation.totalRainfall) : "—"}
          hint={topStation?.name ?? "No match"}
        />
      </section>

      <section className="panel-grid">
        <ChartPanel
          wide
          title="Monthly rainfall trend"
          description="Cumulative mm by month for the current scope."
          filename="rainfall-monthly-trend.png"
          icon={<CloudRain className="panel-icon" aria-hidden />}
          canDownload={trendSeries.length > 0}
        >
          <div className="chart-frame chart-tall">
            {trendSeries.length ? (
              <RainfallTrendChart data={trendSeries} />
            ) : (
              <EmptyState message="No monthly readings for this filter set." />
            )}
          </div>
        </ChartPanel>

        <ChartPanel
          title="Year comparison"
          description="Total rainfall by calendar year."
          filename="rainfall-year-comparison.png"
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
          title="Station map"
          description="Click a marker to focus that station."
          filename="rainfall-station-map.png"
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
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Station</th>
                  <th>District</th>
                  <th>Lat</th>
                  <th>Lon</th>
                  <th>Total</th>
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
            {!filteredStations.length ? (
              <EmptyState message="No stations match these filters." />
            ) : null}
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

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex h-full min-h-40 items-center justify-center px-4 text-center text-sm text-[var(--muted)]">
      {message}
    </div>
  );
}
