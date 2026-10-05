export type Meal = {
  idMeal: string
  strMeal: string
  strMealThumb: string
  strCategory: string
  strArea: string
  strInstructions: string
  strTags: string
  strSource: string
  // The API returns many more fields per meal; only the rendered ones are named.
  [k: string]: string
}

export type MealSummary = Pick<
  Meal,
  'idMeal' | 'strMeal' | 'strMealThumb' | 'strArea' | 'strCategory'
>

type SortKey = 'strMeal' | 'strArea' | 'strCategory'
type Order = 'asc' | 'desc'

export const SORT_KEYS: readonly SortKey[] = ['strMeal', 'strArea', 'strCategory']

export const SORT_LABELS: Record<SortKey, string> = {
  strMeal: 'Name',
  strArea: 'Area',
  strCategory: 'Category',
}

export const NOT_RECORDED = 'Not recorded'

// Unknown params fall back to the default so a hand-edited URL can't break.
export function parseSortKey(v: string | null): SortKey {
  return SORT_KEYS.find((k) => k === v) ?? 'strMeal'
}

export function parseOrder(v: string | null): Order {
  return v === 'desc' ? 'desc' : 'asc'
}
