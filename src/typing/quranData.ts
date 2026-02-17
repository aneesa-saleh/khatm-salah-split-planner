export interface Surah {
    number: number
    name: string
    englishName: string
    englishNameTranslation: string
    numberOfAyahs: number
    revelationType: string
}

// Verse Collection: Page, Hizb Quarter or Juz
export interface VerseCollectionListItem {
    surah: number
    ayah: number
}

export interface JuzPosition extends VerseCollectionListItem {
    page: number
}

export interface JuzListItem {
    start: JuzPosition
    end: JuzPosition
}

export interface VerseCollection {
    count: number
    references: VerseCollectionListItem[]
}

export interface JuzList  {
    count: number
    references: JuzListItem[]
}

export interface PageListItem {
    page: number,
    start: VerseCollectionListItem,
    end: VerseCollectionListItem
}

export interface PageList {
    count: number
    references: PageListItem[]
}

export interface QuranData {
    ayahs: {
        count: number
    },
    surahs: {
        count: number
        references: Surah[]
    }
    pages: PageList,
    hizbQuarters: VerseCollection,
    juzs: JuzList,
}
