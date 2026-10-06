import axios from 'axios'
import type { Meal, MealSummary } from '../types'

const BASE = 'https://www.themealdb.com/api/json/v1/1'
const client = axios.create({ baseURL: BASE })

// API returns `meals: null` or the literal string "Invalid ID" on misses.
type Raw = {
  meals: Meal[] | string | null
  categories: { strCategory: string }[] | null
}

const list = (v: Raw['meals']): Meal[] => (Array.isArray(v) ? v : [])
const or = (v: string | null | undefined, fallback: string): string =>
  v?.trim() || fallback

// strArea isn't in any list endpoint (Detail fetches it per-meal). strCategory
// is left as-is so the UI can show "Not recorded" instead of a fake value.
const normalize = (m: Meal): Meal => ({
  ...m,
  strMeal: or(m.strMeal, 'Untitled'),
  strTags: or(m.strTags, ''),
  strInstructions: or(m.strInstructions, 'No instructions provided.'),
})

export async function fetchCategories(): Promise<string[]> {
  const { data } = await client.get<Raw>('/categories.php')
  return (data.categories ?? []).map((c) => c.strCategory).filter(Boolean)
}

// search.php?f=<letter> returns every meal; only this endpoint fills strCategory.
async function fetchByLetter(letter: string): Promise<Meal[]> {
  const { data } = await client.get<Raw>('/search.php', { params: { f: letter } })
  return list(data.meals).map(normalize)
}

const ALPHABET = 'abcdefghijklmnopqrstuvwxyz'.split('')

export async function fetchAllMeals(): Promise<MealSummary[]> {
  const lists = await Promise.all(ALPHABET.map(fetchByLetter))
  const unique = Array.from(new Map(lists.flat().map((m) => [m.idMeal, m])).values())
  return unique.map(
    ({ idMeal, strMeal, strMealThumb, strArea, strCategory, strTags }) => ({
      idMeal,
      strMeal,
      strMealThumb,
      strArea,
      strCategory,
      strTags,
    }),
  )
}

export async function fetchMeal(id: string): Promise<Meal> {
  const { data } = await client.get<Raw>('/lookup.php', { params: { i: id } })
  const meal = list(data.meals)[0]
  if (!meal) throw new Error('Meal not found')
  return normalize(meal)
}