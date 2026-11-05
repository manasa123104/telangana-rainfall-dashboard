"use client";

type StationOption = { id: string; name: string };

type FiltersProps = {
  years: string[];
  districts: string[];
  stations: StationOption[];
  year: string;
  district: string;
  station: string;
  onYearChange: (value: string) => void;
  onDistrictChange: (value: string) => void;
  onStationChange: (value: string) => void;
};

export function Filters({
  years,
  districts,
  stations,
  year,
  district,
  station,
  onYearChange,
  onDistrictChange,
  onStationChange,
}: FiltersProps) {
  return (
    <div className="filter-bar">
      <label className="filter-field">
        <span>Year</span>
        <select value={year} onChange={(e) => onYearChange(e.target.value)}>
          <option value="all">All years</option>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </label>
      <label className="filter-field">
        <span>District</span>
        <select
          value={district}
          onChange={(e) => onDistrictChange(e.target.value)}
        >
          <option value="all">All districts</option>
          {districts.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </label>
      <label className="filter-field">
        <span>Station</span>
        <select
          value={station}
          onChange={(e) => onStationChange(e.target.value)}
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
  );
}
