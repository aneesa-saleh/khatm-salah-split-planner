import { PageGroup, type PageGroupType } from "./typing"
import { FIRST_JUZ_NUMBER, FIRST_PAGE_NUMBER, LAST_JUZ_NUMBER, LAST_PAGE_NUMBER } from "../data/quranData"

/* Styling */

export const ACCENT_COLOR = "#CF9F30"

/* Page Groups */

export const PageGroupDisplayName = {
    [PageGroup.Juz]: 'Juz',
    [PageGroup.Page]: 'Page'
}

interface PageGroupMinMax {
  min: number
  max: number
}

export const PageGroupLimit: Record<PageGroupType, PageGroupMinMax> = {
  [PageGroup.Juz]: {
    min: FIRST_JUZ_NUMBER,
    max: LAST_JUZ_NUMBER,
  },
  [PageGroup.Page]: {
    min: FIRST_PAGE_NUMBER,
    max: LAST_PAGE_NUMBER,
  },
}