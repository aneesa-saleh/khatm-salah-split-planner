import QURAN_DATA, { FIRST_JUZ_NUMBER, LAST_JUZ_NUMBER } from "../data/quranData";

export const getJuzListInRange = (
    { rangeStart = FIRST_JUZ_NUMBER, rangeEnd = LAST_JUZ_NUMBER }: { rangeStart?: number; rangeEnd?: number }
) => {
    const juzs = QURAN_DATA?.juzs?.references;
    return juzs
}