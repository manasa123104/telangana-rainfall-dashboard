import type { DayPoint, MonthPoint } from "@/lib/types";
import { formatMonthLabel } from "@/lib/format";

/** Southwest monsoon months in Telangana (June–September). */
export const MONSOON_MONTHS = new Set([6, 7, 8, 9]);

export type SeasonTotals = {
  monsoon: number;
  nonMonsoon: number;
  monsoonShare: number;
  monsoonMonths: number;
  nonMonsoonMonths: number;
};

export function monthNumber(month: string): number {
  return Number(month.slice(5, 7));
}

export function splitMonsoon(points: MonthPoint[]): SeasonTotals {
  let monsoon = 0;
  let nonMonsoon = 0;
  let monsoonMonths = 0;
  let nonMonsoonMonths = 0;

  for (const p of points) {
    if (MONSOON_MONTHS.has(monthNumber(p.month))) {
      monsoon += p.rainfall;
      monsoonMonths += 1;
    } else {
      nonMonsoon += p.rainfall;
      nonMonsoonMonths += 1;
    }
  }

  const total = monsoon + nonMonsoon;
  return {
    monsoon,
    nonMonsoon,
    monsoonShare: total > 0 ? monsoon / total : 0,
    monsoonMonths,
    nonMonsoonMonths,
  };
}

export function topWetMonths(
  points: MonthPoint[],
  limit = 5,
): { month: string; label: string; rainfall: number }[] {
  return points
    .slice()
    .sort((a, b) => b.rainfall - a.rainfall)
    .slice(0, limit)
    .map((p) => ({
      month: p.month,
      label: formatMonthLabel(p.month),
      rainfall: p.rainfall,
    }));
}

export function recentDaily(
  points: DayPoint[],
  days: number,
): DayPoint[] {
  if (days <= 0 || points.length === 0) return [];
  return points.slice(-days);
}

export function monthlySeriesToCsv(
  points: MonthPoint[],
  scopeLabel: string,
): string {
  const header = "scope,month,rainfall_mm";
  const rows = points.map(
    (p) =>
      `${csvEscape(scopeLabel)},${p.month},${p.rainfall.toFixed(3)}`,
  );
  return [header, ...rows].join("\n");
}

export function downloadTextFile(
  content: string,
  filename: string,
  mime = "text/csv;charset=utf-8",
) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}
