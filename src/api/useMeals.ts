import { useCallback, useEffect, useState } from 'react'
import { fetchAllMeals, fetchCategories } from './mealdb'
import type { MealSummary } from '../types'

// The catalogue is fetched once (one request per category) and filtered in memory.
// The promise is cached at module scope and dropped on failure so retry() works.
let allPromise: Promise<MealSummary[]> | null = null

export function useCategories() {
  const [categories, setCategories] = useState<string[]>([])
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let alive = true
    fetchCategories()
      .then((c) => {
        if (!alive) return
        setError('')
        setCategories(c)
      })
      .catch(() => {
        if (alive) setError('Failed to load categories.')
      })
    return () => {
      alive = false
    }
  }, [attempt])

  const retry = useCallback(() => {
    setCategories([])
    setError('')
    setAttempt((n) => n + 1)
  }, [])

  return { categories, error, retry }
}

export function useMeals(
  categories: string[],
  selected: string,
  // The catalogue cannot load without categories.
  categoriesFailed = false,
) {
  const [all, setAll] = useState<MealSummary[] | null>(null)
  const [error, setError] = useState('')
  // Bumped by retry() to rerun the effect below.
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (!categories.length) return
    let alive = true
    allPromise ??= fetchAllMeals(categories)
    allPromise
      .then((meals) => {
        if (!alive) return
        setError('')
        setAll(meals)
      })
      .catch(() => {
        allPromise = null
        if (alive) setError('Failed to load meals.')
      })
    return () => {
      alive = false
    }
  }, [categories, attempt])

  const retry = useCallback(() => {
    allPromise = null
    setAll(null)
    setAttempt((n) => n + 1)
  }, [])

  // Error wins over the spinner, so a failure never shows "Loading..." forever.
  if (error) return { meals: [] as MealSummary[], loading: false, error, retry }
  if (categoriesFailed) {
    return { meals: [] as MealSummary[], loading: false, error: 'Failed to load categories.', retry }
  }
  if (!categories.length) return { meals: [] as MealSummary[], loading: true, error, retry }
  if (!all) return { meals: [], loading: true, error, retry }

  const meals = selected ? all.filter((m) => m.strCategory === selected) : all
  return { meals, loading: false, error, retry }
}
