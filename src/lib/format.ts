export function formatRain(mm: number, digits = 0): string {
  if (mm >= 1_000_000) return `${(mm / 1_000_000).toFixed(2)}M mm`;
  if (mm >= 1_000) return `${(mm / 1_000).toFixed(1)}k mm`;
  return `${mm.toFixed(digits)} mm`;
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat("en-IN").format(n);
}

export function formatMonthLabel(month: string): string {
  const [year, m] = month.split("-");
  const names = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return `${names[Number(m) - 1]} '${year.slice(2)}`;
}

export function formatDateLabel(date: string): string {
  const [year, m, d] = date.split("-");
  const names = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return `${Number(d)} ${names[Number(m) - 1]} ${year}`;
}
