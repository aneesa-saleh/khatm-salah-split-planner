export const PageGroup = {
  Page: 'Page',
  Juz: 'Juz',
} as const

export type PageGroupType = (typeof PageGroup)[keyof typeof PageGroup]