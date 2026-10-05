import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { NOT_RECORDED, parseOrder, parseSortKey, SORT_KEYS, parseTags } from './types'
import type { MealSummary, Order, SortKey } from './types'

function readMulti(params: URLSearchParams, key: string): string[] {
  return params.getAll(key).filter((v) => v.length > 0)
}

function writeMulti(
  prev: URLSearchParams,
  key: string,
  values: string[],
): URLSearchParams {
  const next = new URLSearchParams(prev)
  next.delete(key)
  for (const v of values) next.append(key, v)
  return next
}

// Shared by list, gallery and detail. Filters by ?cat and ?q, then sorts.
// Tie-break chain: rotate secondaries so each primary is visibly distinct
// even when one column is constant (e.g. inside cat=Beef).
export function useVisibleMeals(meals: MealSummary[]): MealSummary[] {
  const [params] = useSearchParams()
  const query = params.get('q') ?? ''
  const sortKey = parseSortKey(params.get('sort'))
  const order = parseOrder(params.get('order'))
  const selectedCats = readMulti(params, 'cat')

  return useMemo(() => {
    const q = query.trim().toLowerCase()
    const catSet = selectedCats.length ? new Set(selectedCats) : null

    const matched = meals.filter((m) => {
      if (catSet && !catSet.has(m.strCategory)) return false
      if (!q) return true
      if (m.strMeal.toLowerCase().includes(q)) return true
      if (m.strArea.toLowerCase().includes(q)) return true
      if (m.strCategory.toLowerCase().includes(q)) return true
      for (const t of parseTags(m.strTags)) {
        if (t.toLowerCase().includes(q)) return true
      }
      return false
    })

    const dir = order === 'asc' ? 1 : -1
    type SortColumn = SortKey | 'idMeal'
    const orderKeys: SortColumn[] = (
      sortKey === 'strMeal'
        ? (['strMeal', 'strArea', 'strCategory'] as SortColumn[])
        : sortKey === 'strArea'
          ? (['strArea', 'strMeal', 'strCategory'] as SortColumn[])
          : (['strCategory', 'idMeal', 'strMeal'] as SortColumn[])
    )
    const keyMissing = (v: string) =>
      v === NOT_RECORDED || v.trim() === ''

    // Direction-agnostic: returns -1/0/1 in ascending order; the caller
    // multiplies by `dir` for present-vs-present but skips the flip when
    // either side is missing so missing rows always sink to the bottom.
    const compareKey = (
      a: MealSummary,
      b: MealSummary,
      key: SortColumn,
    ): number => {
      const av = (a[key] ?? '').toLowerCase()
      const bv = (b[key] ?? '').toLowerCase()
      const am = keyMissing(a[key] ?? '')
      const bm = keyMissing(b[key] ?? '')
      if (am && bm) return 0
      if (am) return 1
      if (bm) return -1
      return av.localeCompare(bv)
    }
    const cmp = (a: MealSummary, b: MealSummary): number => {
      for (const key of orderKeys) {
        const r = compareKey(a, b, key)
        if (r === 0) continue
        const missingInvolved =
          keyMissing(a[key] ?? '') || keyMissing(b[key] ?? '')
        return missingInvolved ? r : r * dir
      }
      return a.idMeal.localeCompare(b.idMeal) * dir
    }
    return matched.sort(cmp)
  }, [meals, query, sortKey, order, selectedCats])
}

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

export function useMultiCategory(): {
  selected: string[]
  toggle: (name: string) => void
  clear: () => void
} {
  const [params, setParams] = useSearchParams()
  const selected = readMulti(params, 'cat')

  const setSelected = useCallback(
    (next: string[]) => {
      setParams(
        (prev) => writeMulti(prev, 'cat', next),
        { replace: false },
      )
    },
    [setParams],
  )

  const toggle = useCallback(
    (name: string) => {
      const current = readMulti(params, 'cat')
      if (name === '') {
        setSelected([])
        return
      }
      if (current.includes(name)) {
        setSelected(current.filter((c) => c !== name))
      } else {
        setSelected([...current, name])
      }
    },
    [params, setSelected],
  )

  const clear = useCallback(() => setSelected([]), [setSelected])

  return { selected, toggle, clear }
}

// Search input is locally controlled; URL (?q=) is updated on idle so a
// long query does not flood history.
export function useDebouncedQueryParam(delayMs = 150): [string, string, (next: string) => void] {
  const [params, setParams] = useSearchParams()
  const urlQuery = params.get('q') ?? ''
  const [local, setLocal] = useState(urlQuery)

  useEffect(() => {
    if (local !== urlQuery) setLocal(urlQuery)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlQuery])

  useEffect(() => {
    if (local === urlQuery) return
    const t = setTimeout(() => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          if (local.trim()) next.set('q', local)
          else next.delete('q')
          return next
        },
        { replace: true },
      )
    }, delayMs)
    return () => clearTimeout(t)
  }, [local, urlQuery, delayMs, setParams])

  return [urlQuery, local, setLocal]
}

export type { SortKey, Order }
export { SORT_KEYS }