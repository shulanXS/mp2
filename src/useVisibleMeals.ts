import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { parseOrder, parseSortKey } from './types'
import type { MealSummary } from './types'

// Shared by the list, the gallery and the detail view so all three agree on
// which meals are visible and in what order.
export function useVisibleMeals(meals: MealSummary[]): MealSummary[] {
  const [params] = useSearchParams()
  const query = params.get('q') ?? ''
  const sortKey = parseSortKey(params.get('sort'))
  const order = parseOrder(params.get('order'))

  return useMemo(() => {
    const q = query.trim().toLowerCase()
    const matched = q
      ? meals.filter((m) => m.strMeal.toLowerCase().includes(q))
      : meals.slice()

    const dir = order === 'asc' ? 1 : -1
    return matched.sort(
      (a, b) =>
        (a[sortKey] ?? '').localeCompare(b[sortKey] ?? '') * dir ||
        // The tiebreak needs the same direction, or descending looks like it
        // did nothing when every meal shares one key.
        a.strMeal.localeCompare(b.strMeal) * dir,
    )
  }, [meals, query, sortKey, order])
}

// Read and write one search param. Empty values drop the key.
export function useUrlParam(
  key: string,
  { replace = false }: { replace?: boolean } = {},
): [string, (next: string) => void] {
  const [params, setParams] = useSearchParams()
  const set = useCallback(
    (value: string) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          if (value) next.set(key, value)
          else next.delete(key)
          return next
        },
        { replace },
      )
    },
    [key, replace, setParams],
  )
  return [params.get(key) ?? '', set]
}

export const useQueryParam = (): [string, (next: string) => void] =>
  // replace: true keeps the back button from filling up per keystroke.
  useUrlParam('q', { replace: true })
