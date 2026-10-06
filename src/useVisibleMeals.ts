import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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

// Rotate secondaries per primary so ties don't all collapse on one value.
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
      if ((m.strMeal ?? '').toLowerCase().includes(q)) return true
      if ((m.strArea ?? '').toLowerCase().includes(q)) return true
      if ((m.strCategory ?? '').toLowerCase().includes(q)) return true
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
    // Missing values sink to the bottom regardless of direction.
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
  // setSearchParams swaps identity on every URL change; pin it in a ref so
  // the callback below stays stable and doesn't re-render callers.
  const setParamsRef = useRef(setParams)
  setParamsRef.current = setParams
  const replaceRef = useRef(replace)
  replaceRef.current = replace
  const keyRef = useRef(key)
  keyRef.current = key

  const set = useCallback((value: string) => {
    const next = new URLSearchParams(params)
    if (value) next.set(keyRef.current, value)
    else next.delete(keyRef.current)
    setParamsRef.current(next, { replace: replaceRef.current })
  }, [params])
  return [params.get(key) ?? '', set]
}

export function useMultiCategory(): {
  selected: string[]
  toggle: (name: string) => void
  clear: () => void
} {
  const [params, setParams] = useSearchParams()
  const setParamsRef = useRef(setParams)
  setParamsRef.current = setParams
  const selected = readMulti(params, 'cat')

  const setSelected = useCallback(
    (next: string[]) => {
      setParamsRef.current(writeMulti(params, 'cat', next), { replace: false })
    },
    [params],
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

export function useDebouncedQueryParam(delayMs = 150): [string, string, (next: string) => void] {
  const [params, setParams] = useSearchParams()
  const urlQuery = params.get('q') ?? ''
  const [local, setLocal] = useState(urlQuery)
  // See useUrlParam — setParams' identity is not stable.
  const setParamsRef = useRef(setParams)
  setParamsRef.current = setParams

  useEffect(() => {
    if (local !== urlQuery) setLocal(urlQuery)
  }, [urlQuery])

  useEffect(() => {
    if (local === urlQuery) return
    const t = setTimeout(() => {
      const next = new URLSearchParams(params)
      if (local.trim()) next.set('q', local)
      else next.delete('q')
      setParamsRef.current(next, { replace: true })
    }, delayMs)
    return () => clearTimeout(t)
  }, [local, urlQuery, delayMs, params])

  return [urlQuery, local, setLocal]
}

export type { SortKey, Order }
export { SORT_KEYS }