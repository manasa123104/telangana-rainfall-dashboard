"use client";

type StationOption = { id: string; name: string };

type FiltersProps = {
  years: string[];
  districts: string[];
  stations: StationOption[];
  year: string;
  district: string;
  station: string;
  scopeLabel: string;
  onYearChange: (value: string) => void;
  onDistrictChange: (value: string) => void;
  onStationChange: (value: string) => void;
  onReset: () => void;
  onExportCsv: () => void;
  canExportCsv: boolean;
};

export function Filters({
  years,
  districts,
  stations,
  year,
  district,
  station,
  scopeLabel,
  onYearChange,
  onDistrictChange,
  onStationChange,
  onReset,
  onExportCsv,
  canExportCsv,
}: FiltersProps) {
  const filtersActive =
    year !== "all" || district !== "all" || station !== "all";

  return (
    <div className="filter-bar" role="search" aria-label="Rainfall filters">
      <div className="filter-bar-main">
        <label className="filter-field" htmlFor="filter-year">
          <span id="filter-year-label">Year</span>
          <select
            id="filter-year"
            value={year}
            onChange={(e) => onYearChange(e.target.value)}
            aria-labelledby="filter-year-label"
          >
            <option value="all">All years</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </label>
        <label className="filter-field" htmlFor="filter-district">
          <span id="filter-district-label">District</span>
          <select
            id="filter-district"
            value={district}
            onChange={(e) => onDistrictChange(e.target.value)}
            aria-labelledby="filter-district-label"
          >
            <option value="all">All districts</option>
            {districts.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </label>
        <label className="filter-field" htmlFor="filter-station">
          <span id="filter-station-label">Station</span>
          <select
            id="filter-station"
            value={station}
            onChange={(e) => onStationChange(e.target.value)}
            aria-labelledby="filter-station-label"
          >
            <option value="all">All stations</option>
            {stations.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="filter-bar-meta">
        <p className="filter-scope">
          Viewing <strong>{scopeLabel}</strong>
          {year !== "all" ? (
            <>
              {" "}
              · <span>{year}</span>
            </>
          ) : null}
        </p>
        <div className="filter-actions">
          <button
            type="button"
            className="filter-btn"
            onClick={onExportCsv}
            disabled={!canExportCsv}
            title="Download the current monthly series as CSV"
          >
            Export CSV
          </button>
          <button
            type="button"
            className="filter-btn filter-btn-ghost"
            onClick={onReset}
            disabled={!filtersActive}
            title="Clear year, district, and station filters"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
