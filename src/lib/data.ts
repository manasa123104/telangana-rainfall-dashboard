import summaryJson from "@/data/summary.json";
import districtsJson from "@/data/districts.json";
import stationsJson from "@/data/stations.json";
import stationMonthlyJson from "@/data/station-monthly.json";
import type { District, Station, StationMonthly, Summary } from "@/lib/types";

export const summary = summaryJson as Summary;
export const districts = districtsJson as District[];
export const stations = stationsJson as Station[];
export const stationMonthly = stationMonthlyJson as StationMonthly;

export const years = Object.keys(summary.byYear).sort();
