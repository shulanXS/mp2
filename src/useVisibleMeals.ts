import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { NOT_RECORDED, parseOrder, parseSortKey } from './types'
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
    // Rows whose sort key is the NOT_RECORDED fallback sort after every other
    // row, regardless of direction, so a missing field never pins one meal to
    // the top of the list in either ascending or descending order.
    const cmp = (a: MealSummary, b: MealSummary): number => {
      const av = a[sortKey] === NOT_RECORDED
      const bv = b[sortKey] === NOT_RECORDED
      if (av !== bv) return av ? 1 : -1
      return (a[sortKey] ?? '').localeCompare(b[sortKey] ?? '')
    }
    return matched.sort(
      (a, b) => {
        const primary = cmp(a, b)
        if (primary !== 0) return primary * dir
        return a.strMeal.localeCompare(b.strMeal) * dir
      },
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
