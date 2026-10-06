export type Meal = {
  idMeal: string
  strMeal: string
  strMealThumb: string
  strCategory: string
  strArea: string
  strInstructions: string
  strTags: string
  strSource: string
  // API returns many more fields; only the rendered ones are named.
  [k: string]: string
}

export type MealSummary = Pick<
  Meal,
  'idMeal' | 'strMeal' | 'strMealThumb' | 'strArea' | 'strCategory' | 'strTags'
>

export function parseTags(raw: string | undefined | null): string[] {
  if (!raw) return []
  return raw
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)
}

export type SortKey = 'strMeal' | 'strArea' | 'strCategory'
export type Order = 'asc' | 'desc'

export const SORT_KEYS: readonly SortKey[] = ['strMeal', 'strArea', 'strCategory']

export const SORT_LABELS: Record<SortKey, string> = {
  strMeal: 'Name',
  strArea: 'Area',
  strCategory: 'Category',
}

export const NOT_RECORDED = 'Not recorded'

// Unknown URL values fall back to defaults so hand-edited URLs don't break.
export function parseSortKey(v: string | null): SortKey {
  return SORT_KEYS.find((k) => k === v) ?? 'strMeal'
}

export function parseOrder(v: string | null): Order {
  return v === 'desc' ? 'desc' : 'asc'
}