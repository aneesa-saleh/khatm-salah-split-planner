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

export interface VerseCollection {
        count: number
        references: VerseCollectionListItem[]
    }

export interface QuranData {
    ayahs: {
        count: number
    },
    surahs: {
        count: number
        references: Surah[]
    }
    pages: VerseCollection,
    hizbQuarters: VerseCollection,
    juzs: VerseCollection,
}
