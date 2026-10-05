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

// search.php?f=<letter> returns one slice of the catalogue. Pulling every
// letter a..z in parallel gives the whole list with every field populated;
// this is what makes sorting by Area or Category actually differ from sorting
// by Name, which the older filter.php endpoint (which omits strArea and
// strCategory) could not.
async function fetchByLetter(letter: string): Promise<Meal[]> {
  const { data } = await client.get<Raw>('/search.php', { params: { f: letter } })
  return list(data.meals).map(normalize)
}

const ALPHABET = 'abcdefghijklmnopqrstuvwxyz'.split('')

export async function fetchAllMeals(): Promise<MealSummary[]> {
  const lists = await Promise.all(ALPHABET.map(fetchByLetter))
  const flat = lists.flat()
  // A meal belongs to one category, but dedupe in case the API ever overlaps
  // an id across letters.
  const unique = Array.from(new Map(flat.map((m) => [m.idMeal, m])).values())
  return unique.map(
    ({ idMeal, strMeal, strMealThumb, strArea, strCategory }) => ({
      idMeal,
      strMeal,
      strMealThumb,
      strArea,
      strCategory,
    }),
  )
}

export async function fetchMeal(id: string): Promise<Meal> {
  const { data } = await client.get<Raw>('/lookup.php', { params: { i: id } })
  const meal = list(data.meals)[0]
  if (!meal) throw new Error('Meal not found')
  return normalize(meal)
}
