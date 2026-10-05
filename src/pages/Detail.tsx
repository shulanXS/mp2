import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { fetchMeal } from '../api/mealdb'
import { useVisibleMeals } from '../useVisibleMeals'
import { NOT_RECORDED } from '../types'
import type { Meal, MealSummary } from '../types'
import styles from './Detail.module.css'

// The API mixes \r\n, \r\r and stray \r, which would render as blank lines
// under white-space: pre-line.
function formatInstructions(raw: string): string {
  const text = raw.replace(/\r\n?/g, '\n').trim()
  if (!text) return 'No instructions provided.'
  return text
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .join('\n\n')
}

type Props = { meals: MealSummary[] }

// Shows the host rather than a 120-character URL.
function sourceLabel(url: string): string {
  try {
    const { hostname, pathname } = new URL(url)
    const path = pathname === '/' ? '' : pathname.replace(/\/$/, '')
    const trimmed = path.length > 28 ? `${path.slice(0, 28)}…` : path
    return `${hostname.replace(/^www\./, '')}${trimmed}`
  } catch {
    return url
  }
}

export function Detail({ meals }: Props) {
  const { id } = useParams()
  const [params] = useSearchParams()
  const location = useLocation()
  const navigate = useNavigate()
  const [meal, setMeal] = useState<Meal | null>(null)
  const [error, setError] = useState('')

  // A referrer check cannot tell "arrived from /gallery" from "opened in a new
  // tab", so the origin is passed through router state.
  const fromGallery = (location.state as { from?: string } | null)?.from === '/gallery'

  // The list's own filtering and ordering, so Next/Previous walk the sequence
  // the user actually saw.
  const siblings = useVisibleMeals(meals)

  useEffect(() => {
    if (!id) return
    setMeal(null)
    setError('')
    let alive = true
    fetchMeal(id)
      .then((m) => alive && setMeal(m))
      .catch(() => alive && setError('Failed to load this meal.'))
    return () => {
      alive = false
    }
  }, [id])

  // Siblings come from the ?cat= in the URL, so a direct link still gets prev/next.
  const index = siblings.findIndex((m) => m.idMeal === id)
  const total = siblings.length
  const target = (delta: number) => {
    if (index < 0) return
    const next = (index + delta + total) % total
    navigate({ pathname: `/detail/${siblings[next].idMeal}`, search: params.toString() })
  }

  if (error) return <p className={styles.error}>{error}</p>
  if (!meal) return <p>Loading...</p>
  const ingredients = Array.from({ length: 20 }, (_, i) => i + 1)
    .map((i) => ({ name: meal[`strIngredient${i}`]?.trim(), measure: meal[`strMeasure${i}`]?.trim() }))
    .filter((x) => x.name)
    // Index is in the key: a recipe can list salt twice with different measures.
    .map((x, i) => ({ ...x, key: `${x.name}-${i}` }))

  return (
    <article className={styles.detail}>
      <nav className={styles.nav}>
        <button onClick={() => target(-1)} disabled={index < 0}>
          ← Previous
        </button>
        <div className={styles.navMid}>
          {index >= 0 && (
            <span className={styles.position}>
              {index + 1} of {total}
            </span>
          )}
          {/* Filled and first in the tab order: this is the way out. */}
          <Link
            to={{ pathname: fromGallery ? '/gallery' : '/', search: params.toString() }}
            className={styles.back}
          >
            ← Back to {fromGallery ? 'gallery' : 'list'}
          </Link>
        </div>
        <button onClick={() => target(1)} disabled={index < 0}>
          Next →
        </button>
      </nav>

      <div className={styles.body}>
        <img src={meal.strMealThumb} alt={meal.strMeal} />
        <div>
          <h1>{meal.strMeal}</h1>
          <dl className={styles.meta}>
            <dt>Category</dt>
            <dd>{meal.strCategory || NOT_RECORDED}</dd>
            <dt>Area</dt>
            <dd>{meal.strArea || NOT_RECORDED}</dd>
            <dt>Tags</dt>
            <dd>{meal.strTags || '—'}</dd>
            <dt>Source</dt>
            <dd>
              {meal.strSource ? (
                <a href={meal.strSource} target="_blank" rel="noreferrer">
                  {sourceLabel(meal.strSource)}
                </a>
              ) : (
                '—'
              )}
            </dd>
          </dl>

          <h2>Ingredients</h2>
          {ingredients.length > 0 ? (
            <ul className={styles.ingredients}>
              {ingredients.map((x) => (
                <li key={x.key}>
                  {x.name}
                  {x.measure ? ` — ${x.measure}` : ''}
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.emptyNote}>No ingredients listed.</p>
          )}

          <h2>Instructions</h2>
          <p className={styles.instructions}>{formatInstructions(meal.strInstructions)}</p>
        </div>
      </div>
    </article>
  )
}
