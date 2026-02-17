export interface SalahRange {
  start: string;
  end: string;
  totalPages: number;
}

export interface DaySchedule {
  day: number;
  totalPages: number;
  start: string;
  end: string;
  tahajjud: SalahRange | null;
  fajr: SalahRange | null;
  zuhr: SalahRange | null;
  asr: SalahRange | null;
  maghrib: SalahRange | null;
  isha: SalahRange | null;
}
