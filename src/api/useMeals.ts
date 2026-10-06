import { useCallback, useEffect, useState } from 'react'
import { fetchAllMeals, fetchCategories } from './mealdb'
import type { MealSummary } from '../types'

// Module-level cache so StrictMode double-mount and route changes don't
// refetch; nulled on failure so retry() actually retries.
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

// Returns the full unfiltered catalogue. Filtering by ?cat happens in
// useVisibleMeals so multi-select and Detail's prev/next stay consistent.
export function useMeals(categoriesFailed = false) {
  const [all, setAll] = useState<MealSummary[] | null>(null)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let alive = true
    allPromise ??= fetchAllMeals()
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
  }, [attempt])

  const retry = useCallback(() => {
    allPromise = null
    setAll(null)
    setAttempt((n) => n + 1)
  }, [])

  if (error)
    return { meals: [] as MealSummary[], loading: false, error, retry }
  if (categoriesFailed)
    return {
      meals: [] as MealSummary[],
      loading: false,
      error: 'Failed to load categories.',
      retry,
    }
  if (!all) return { meals: [], loading: true, error, retry }
  return { meals: all, loading: false, error, retry }
}