import axios from 'axios'
import { NOT_RECORDED } from '../types'
import type { Meal, MealSummary } from '../types'

const BASE = 'https://www.themealdb.com/api/json/v1/1'
const client = axios.create({ baseURL: BASE })

// The API returns null or the string "Invalid ID" when nothing matches.
type Raw = {
  meals: Meal[] | string | null
  categories: { strCategory: string }[] | null
}

const list = (v: Raw['meals']): Meal[] => (Array.isArray(v) ? v : [])
const or = (v: string | null | undefined, fallback: string): string =>
  v?.trim() || fallback

// TheMealDB leaves many fields null (strArea especially) and strTags is often
// empty, so they are normalized here rather than in each view.
const normalize = (m: Meal): Meal => ({
  ...m,
  strMeal: or(m.strMeal, 'Untitled'),
  strArea: or(m.strArea, NOT_RECORDED),
  strCategory: or(m.strCategory, NOT_RECORDED),
  strTags: or(m.strTags, ''),
  strInstructions: or(m.strInstructions, 'No instructions provided.'),
})

export async function fetchCategories(): Promise<string[]> {
  const { data } = await client.get<Raw>('/categories.php')
  return (data.categories ?? []).map((c) => c.strCategory).filter(Boolean)
}

export async function fetchByCategory(category: string): Promise<MealSummary[]> {
  const { data } = await client.get<Raw>('/filter.php', { params: { c: category } })
  // filter.php omits strCategory, so the requested category fills it in.
  return list(data.meals)
    .map((m) => normalize({ ...m, strCategory: m.strCategory || category }))
    .map(({ idMeal, strMeal, strMealThumb, strArea, strCategory }) => ({
      idMeal,
      strMeal,
      strMealThumb,
      strArea,
      strCategory,
    }))
}

export async function fetchAllMeals(categories: string[]): Promise<MealSummary[]> {
  const lists = await Promise.all(categories.map(fetchByCategory))
  // A meal belongs to one category, but dedupe in case the API ever overlaps.
  return Array.from(new Map(lists.flat().map((m) => [m.idMeal, m])).values())
}

export async function fetchMeal(id: string): Promise<Meal> {
  const { data } = await client.get<Raw>('/lookup.php', { params: { i: id } })
  const meal = list(data.meals)[0]
  if (!meal) throw new Error('Meal not found')
  return normalize(meal)
}
