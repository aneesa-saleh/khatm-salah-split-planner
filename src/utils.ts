import QURAN_DATA, { FIRST_JUZ_NUMBER, FIRST_PAGE_NUMBER, LAST_JUZ_NUMBER, LAST_PAGE_NUMBER } from "../data/quranData";
import type { JuzListItem, PageListItem } from "./typing/quranData";
import type { DaySchedule, SalahRange } from "./typing/schedule";
import type { ScheduleForm } from "./typing/scheduleForm";

export function getJuzInfo(juzNumber: number): JuzListItem {
    if (juzNumber > LAST_JUZ_NUMBER || juzNumber < FIRST_JUZ_NUMBER) return {start: { ayah: 1, page: 1, surah: 1}, end: { ayah: 1, page: 1, surah: 1}};

    return QURAN_DATA?.juzs?.references[juzNumber - 1];
}

export function getPageInfo(pageNumber: number): PageListItem {
    if (pageNumber > LAST_PAGE_NUMBER || pageNumber < FIRST_PAGE_NUMBER) return QURAN_DATA?.pages?.references[0];

    return QURAN_DATA?.pages?.references[pageNumber - 1];
}


export function getSurahName (surahNumber: number) {
    if (surahNumber > 114 || surahNumber < 1) return "";

    return QURAN_DATA?.surahs?.references[surahNumber - 1]?.englishName;
}

export function formatPageVerseRange (pageNumber: number) {
  const page = QURAN_DATA?.pages?.references[pageNumber - 1] || QURAN_DATA?.pages?.references[0]

  return `Page ${page?.page} (${getSurahName(
        page?.start?.surah
      )} ${page?.start?.surah}:${page?.start?.ayah} → ${getSurahName(
        page?.end?.surah
      )} ${page?.end?.surah}:${page?.end?.ayah})`
}

const SALAH_ORDER = [
  "tahajjud",
  "fajr",
  "zuhr",
  "asr",
  "maghrib",
  "isha",
] as const;

type SalahKey = typeof SALAH_ORDER[number];

export function getSelectedSalahs(form: ScheduleForm): SalahKey[] {
  return SALAH_ORDER.filter((salah) => {
    return form[`${salah}Checked` as keyof ScheduleForm] === true;
  });
}

export function splitEvenly(total: number, parts: number): number[] {
  const base = Math.floor(total / parts);
  const remainder = total % parts;

  return Array.from({ length: parts }, (_, i) =>
    i < remainder ? base + 1 : base
  );
}

export function generateRevisionSchedule(
  form: ScheduleForm,
  // pageSplitPreset?: number,
): DaySchedule[] {
  const startJuz = form.rangeStart;
  const endJuz = form.rangeEnd;
  const days = Number(form.daysToComplete);

  // Resolve page range
  const startJuzInfo = getJuzInfo(startJuz);
  const endJuzInfo = getJuzInfo(endJuz);

  const startPage = startJuzInfo.start.page;
  const endPage = endJuzInfo.end.page;

  const totalPages = endPage - startPage + 1;

  const pagesPerDay = splitEvenly(totalPages, days);

  const selectedSalahs = getSelectedSalahs(form);

  let currentPage = startPage;
  const schedule: DaySchedule[] = [];

  for (let dayIndex = 0; dayIndex < days; dayIndex++) {
    const dayPages = pagesPerDay[dayIndex];
    const dayStartPage = currentPage;
    const dayEndPage = currentPage + dayPages - 1;

    // Split day pages across salahs
    const pagesPerSalah = splitEvenly(
      dayPages,
      selectedSalahs.length
    );

    let salahPageCursor = dayStartPage;

    const salahRanges: Partial<Record<SalahKey, SalahRange>> = {};

    selectedSalahs.forEach((salah, i) => {
      const salahPageCount = pagesPerSalah[i];
      const salahStartPage = salahPageCursor;
      const salahEndPage = salahPageCursor + salahPageCount - 1;

      salahRanges[salah] = {
        start: formatPageVerseRange(salahStartPage),
        end: formatPageVerseRange(salahEndPage),
        totalPages: salahPageCount,
      };

      salahPageCursor += salahPageCount;
    });

    schedule.push({
      day: dayIndex + 1,
      totalPages: dayPages,
      start: formatPageVerseRange(dayStartPage),
      end: formatPageVerseRange(dayEndPage),
      tahajjud: salahRanges.tahajjud ?? null,
      fajr: salahRanges.fajr ?? null,
      zuhr: salahRanges.zuhr ?? null,
      asr: salahRanges.asr ?? null,
      maghrib: salahRanges.maghrib ?? null,
      isha: salahRanges.isha ?? null,
    });

    currentPage = dayEndPage + 1;
  }

  return schedule;
}

/* table */

export function formatSalahCell(salahData: {
  start: string
  end: string
  totalPages: number
}) {
  return `[${salahData.totalPages} pages]\n${salahData?.start} to\n${salahData?.end}`
}

const SALAHS = ['tahajjud', 'fajr', 'zuhr', 'asr', 'maghrib', 'isha'] as const

export function buildExcelTable(schedule: DaySchedule[]) {
  // Determine which salah columns are actually used
  const activeSalahs = SALAHS.filter(salah =>
    schedule.some(day => day[salah])
  )

  // Header row
  const HEADER_ROW = [
    { value: 'Day', fontWeight: 'bold' },
    { value: 'Target for the Day', fontWeight: 'bold' },
    ...activeSalahs.map(salah => ({
      value: salah.charAt(0).toUpperCase() + salah.slice(1),
      fontWeight: 'bold'
    }))
  ]

  // Data rows
  const DATA_ROWS = schedule.map(day => {
    const baseCells = [
      { type: String, value: `Day ${day.day}`,  },
      { type: String, value: formatSalahCell(day), wrap: true },
    ]

    const salahCells = activeSalahs.map(salah => {
      const salahData = day[salah]

      return {
        type: String,
        value: salahData ? formatSalahCell(salahData) : '',
        wrap: true 
      }
    })

    return [...baseCells, ...salahCells]
  })

  // Final structure for write-excel-file
  return [HEADER_ROW, ...DATA_ROWS]
}

const COLUMN_WIDTH = 50;
export const columnConfig = [
  {},
  { width: COLUMN_WIDTH },
  { width: COLUMN_WIDTH },
  { width: COLUMN_WIDTH },
  { width: COLUMN_WIDTH },
  { width: COLUMN_WIDTH },
  { width: COLUMN_WIDTH },
  { width: COLUMN_WIDTH }
];

export function getScheduleFileName({ startJuz, endJuz, dayCount}: {startJuz: number, endJuz: number, dayCount: number}) {
  return `Juz ${startJuz} to ${endJuz} in ${dayCount} days`;
}

