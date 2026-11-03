"use client";

import type { Station } from "@/lib/types";
import { formatRain } from "@/lib/format";

type StationMapProps = {
  stations: Station[];
  selected?: string;
  onSelect?: (stationId: string) => void;
};

export function StationMap({ stations, selected, onSelect }: StationMapProps) {
  if (!stations.length) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-[var(--muted)]">
        No stations match the current filters.
      </div>
    );
  }

  const lats = stations.map((s) => s.lat);
  const lons = stations.map((s) => s.lon);
  const minLat = Math.min(...lats) - 0.15;
  const maxLat = Math.max(...lats) + 0.15;
  const minLon = Math.min(...lons) - 0.15;
  const maxLon = Math.max(...lons) + 0.15;
  const maxRain = Math.max(...stations.map((s) => s.totalRainfall), 1);

  const width = 640;
  const height = 420;
  const pad = 28;

  const project = (lat: number, lon: number) => {
    const x = pad + ((lon - minLon) / (maxLon - minLon)) * (width - pad * 2);
    const y =
      pad + ((maxLat - lat) / (maxLat - minLat)) * (height - pad * 2);
    return { x, y };
  };

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-full w-full"
      role="img"
      aria-label="Station rainfall map of Telangana"
    >
      <defs>
        <radialGradient id="mapGlow" cx="50%" cy="45%" r="60%">
          <stop offset="0%" stopColor="#9ed4d0" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#d9ebe8" stopOpacity="0.15" />
        </radialGradient>
      </defs>
      <rect width={width} height={height} rx="18" fill="url(#mapGlow)" />
      {[0.25, 0.5, 0.75].map((t) => (
        <line
          key={`h-${t}`}
          x1={pad}
          x2={width - pad}
          y1={pad + t * (height - pad * 2)}
          y2={pad + t * (height - pad * 2)}
          stroke="rgba(15,76,92,0.08)"
        />
      ))}
      {[0.25, 0.5, 0.75].map((t) => (
        <line
          key={`v-${t}`}
          y1={pad}
          y2={height - pad}
          x1={pad + t * (width - pad * 2)}
          x2={pad + t * (width - pad * 2)}
          stroke="rgba(15,76,92,0.08)"
        />
      ))}
      {stations.map((station) => {
        const { x, y } = project(station.lat, station.lon);
        const r = 6 + (station.totalRainfall / maxRain) * 16;
        const active = selected === station.id;
        return (
          <g
            key={station.id}
            className="cursor-pointer"
            onClick={() => onSelect?.(station.id)}
          >
            <circle
              cx={x}
              cy={y}
              r={r}
              fill={active ? "#c9852d" : "#147878"}
              fillOpacity={active ? 0.9 : 0.55}
              stroke={active ? "#8a5a12" : "#0f4c5c"}
              strokeWidth={active ? 2 : 1}
            >
              <title>
                {station.name} · {station.district} ·{" "}
                {formatRain(station.totalRainfall)}
              </title>
            </circle>
            {active ? (
              <text
                x={x}
                y={y - r - 8}
                textAnchor="middle"
                fill="#0f2f38"
                fontSize="11"
                fontWeight="600"
              >
                {station.name}
              </text>
            ) : null}
          </g>
        );
      })}
      <text x={pad} y={height - 10} fill="#5b7580" fontSize="11">
        Circle size ∝ cumulative rainfall
      </text>
    </svg>
  );
}
