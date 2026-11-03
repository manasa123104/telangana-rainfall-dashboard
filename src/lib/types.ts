export type MonthPoint = {
  month: string;
  rainfall: number;
};

export type DayPoint = {
  date: string;
  rainfall: number;
};

export type HourPoint = {
  hour: number;
  avgRainfall: number;
  samples: number;
};

export type Summary = {
  title: string;
  agency: string;
  source: string;
  records: number;
  nonzeroRecords: number;
  stations: number;
  districts: number;
  dateStart: string;
  dateEnd: string;
  totalRainfall: number;
  byYear: Record<string, number>;
  monthly: MonthPoint[];
  daily: DayPoint[];
  hourlyPattern: HourPoint[];
};

export type District = {
  name: string;
  totalRainfall: number;
  byYear: Record<string, number>;
  monthly: MonthPoint[];
};

export type Station = {
  id: string;
  name: string;
  district: string;
  lat: number;
  lon: number;
  agency: string;
  totalRainfall: number;
};

export type StationMonthly = Record<string, MonthPoint[]>;
